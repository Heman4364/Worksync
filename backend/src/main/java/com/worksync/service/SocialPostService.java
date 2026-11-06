package com.worksync.service;

import com.worksync.dto.KafkaDtos.KafkaEventPublishRequest;
import com.worksync.dto.SocialDtos.*;
import com.worksync.entity.*;
import com.worksync.exception.BadRequestException;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.kafka.KafkaReliabilityEngine;
import com.worksync.repository.SocialPostRepository;
import com.worksync.repository.WorkspaceRepository;
import com.worksync.strategy.ValidationResult;
import com.worksync.strategy.ValidationStrategy;
import com.worksync.strategy.ValidationStrategyFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SocialPostService {

    private static final Logger log = LoggerFactory.getLogger(SocialPostService.class);

    private final SocialPostRepository postRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ValidationStrategyFactory strategyFactory;
    private final KafkaReliabilityEngine kafkaReliabilityEngine;
    private final ActivityLogService activityLogService;
    private final WorkflowAutomationEngine workflowEngine;

    public SocialPostService(SocialPostRepository postRepository,
                             WorkspaceRepository workspaceRepository,
                             ValidationStrategyFactory strategyFactory,
                             KafkaReliabilityEngine kafkaReliabilityEngine,
                             ActivityLogService activityLogService,
                             WorkflowAutomationEngine workflowEngine) {
        this.postRepository = postRepository;
        this.workspaceRepository = workspaceRepository;
        this.strategyFactory = strategyFactory;
        this.kafkaReliabilityEngine = kafkaReliabilityEngine;
        this.activityLogService = activityLogService;
        this.workflowEngine = workflowEngine;
    }

    public PostValidationResultDto validatePost(PostValidateRequest request) {
        ValidationStrategy strategy = strategyFactory.getStrategy(request.getPlatform());
        ValidationResult result = strategy.validate(request.getContent(), request.getMediaUrls());

        return new PostValidationResultDto(
                request.getPlatform(),
                result.isValid(),
                result.getCharacterCount(),
                result.getMaxCharacters(),
                result.getErrors(),
                result.getWarnings()
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardAnalytics", allEntries = true)
    public PostDto createPost(PostCreateRequest req, User author) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        // Run platform strategy validation
        ValidationStrategy strategy = strategyFactory.getStrategy(req.getPlatform());
        ValidationResult valResult = strategy.validate(req.getContent(), req.getMediaUrls());

        if (!valResult.isValid()) {
            throw new BadRequestException("Post content does not meet " + req.getPlatform() + " requirements: " +
                    String.join(", ", valResult.getErrors()));
        }

        SocialPost post = new SocialPost();
        post.setWorkspace(ws);
        post.setAuthor(author);
        post.setPlatform(req.getPlatform());
        post.setContent(req.getContent());
        post.setMediaUrls(req.getMediaUrls());

        String eventId = "post-" + UUID.randomUUID().toString().substring(0, 8);
        post.setEventId(eventId);

        if (req.getScheduledAt() != null && req.getScheduledAt().isAfter(LocalDateTime.now())) {
            post.setStatus(PostStatus.SCHEDULED);
            post.setScheduledAt(req.getScheduledAt());
        } else {
            post.setStatus(PostStatus.PUBLISHING);
        }

        post = postRepository.save(post);

        // Dispatch to Kafka Reliability Subsystem
        KafkaEventPublishRequest kafkaReq = new KafkaEventPublishRequest();
        kafkaReq.setEventId(eventId);
        kafkaReq.setTopic("scheduled-posts");
        kafkaReq.setPayload("{\"postId\":" + post.getId() + ",\"platform\":\"" + post.getPlatform() + "\",\"content\":\"" +
                escapeJson(post.getContent()) + "\"}");
        kafkaReq.setSimulationMode(req.getSimulationMode());

        try {
            var kafkaEvent = kafkaReliabilityEngine.publishEvent(kafkaReq);
            if ("COMPLETED".equals(kafkaEvent.getStatus())) {
                post.setStatus(PostStatus.PUBLISHED);
                post.setPublishedAt(LocalDateTime.now());
            } else if ("DLQ".equals(kafkaEvent.getStatus())) {
                post.setStatus(PostStatus.FAILED);
                post.setFailureReason(kafkaEvent.getFailureReason());
                workflowEngine.triggerEvent("POST_FAILED", ws.getId(), post);
            }
            post = postRepository.save(post);
        } catch (Exception e) {
            log.error("Kafka reliability pipeline error: {}", e.getMessage());
        }

        activityLogService.logActivity(ws, author, "CREATE", "SOCIAL_POST", post.getId(), null,
                post.getPlatform() + ": " + post.getContent().substring(0, Math.min(post.getContent().length(), 50)));

        return PostDto.fromEntity(post);
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getWorkspacePosts(Long workspaceId, Pageable pageable) {
        return postRepository.findByWorkspaceIdWithAuthor(workspaceId, pageable)
                .map(PostDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(Long id) {
        SocialPost p = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        return PostDto.fromEntity(p);
    }

    @Transactional
    public void deletePost(Long id, User currentUser) {
        SocialPost p = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        activityLogService.logActivity(p.getWorkspace(), currentUser, "DELETE", "SOCIAL_POST", id, p.getContent(), null);
        postRepository.delete(p);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }
}
