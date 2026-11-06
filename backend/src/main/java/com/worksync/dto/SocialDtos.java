package com.worksync.dto;

import com.worksync.entity.PostStatus;
import com.worksync.entity.SocialPlatform;
import com.worksync.entity.SocialPost;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class SocialDtos {

    public static class PostDto {
        private Long id;
        private Long workspaceId;
        private Long authorId;
        private String authorName;
        private SocialPlatform platform;
        private String content;
        private String mediaUrls;
        private PostStatus status;
        private LocalDateTime scheduledAt;
        private LocalDateTime publishedAt;
        private String failureReason;
        private int attemptCount;
        private String eventId;
        private LocalDateTime createdAt;

        public static PostDto fromEntity(SocialPost p) {
            if (p == null) return null;
            PostDto dto = new PostDto();
            dto.setId(p.getId());
            dto.setWorkspaceId(p.getWorkspace().getId());
            if (p.getAuthor() != null) {
                dto.setAuthorId(p.getAuthor().getId());
                dto.setAuthorName(p.getAuthor().getFirstName() + " " + p.getAuthor().getLastName());
            }
            dto.setPlatform(p.getPlatform());
            dto.setContent(p.getContent());
            dto.setMediaUrls(p.getMediaUrls());
            dto.setStatus(p.getStatus());
            dto.setScheduledAt(p.getScheduledAt());
            dto.setPublishedAt(p.getPublishedAt());
            dto.setFailureReason(p.getFailureReason());
            dto.setAttemptCount(p.getAttemptCount());
            dto.setEventId(p.getEventId());
            dto.setCreatedAt(p.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMediaUrls() { return mediaUrls; }
        public void setMediaUrls(String mediaUrls) { this.mediaUrls = mediaUrls; }
        public PostStatus getStatus() { return status; }
        public void setStatus(PostStatus status) { this.status = status; }
        public LocalDateTime getScheduledAt() { return scheduledAt; }
        public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
        public LocalDateTime getPublishedAt() { return publishedAt; }
        public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
        public int getAttemptCount() { return attemptCount; }
        public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class PostCreateRequest {
        private Long workspaceId;
        @NotNull(message = "Platform is required")
        private SocialPlatform platform;
        private String content;
        private String mediaUrls;
        private LocalDateTime scheduledAt;
        private String simulationMode = "NONE"; // NONE, TEMPORARY, PERMANENT, DUPLICATE

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMediaUrls() { return mediaUrls; }
        public void setMediaUrls(String mediaUrls) { this.mediaUrls = mediaUrls; }
        public LocalDateTime getScheduledAt() { return scheduledAt; }
        public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
        public String getSimulationMode() { return simulationMode; }
        public void setSimulationMode(String simulationMode) { this.simulationMode = simulationMode; }
    }

    public static class PostValidateRequest {
        @NotNull(message = "Platform is required")
        private SocialPlatform platform;
        private String content;
        private String mediaUrls;

        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMediaUrls() { return mediaUrls; }
        public void setMediaUrls(String mediaUrls) { this.mediaUrls = mediaUrls; }
    }

    public static class PostValidationResultDto {
        private SocialPlatform platform;
        private boolean valid;
        private int characterCount;
        private int maxCharacters;
        private List<String> errors;
        private List<String> warnings;

        public PostValidationResultDto() {}

        public PostValidationResultDto(SocialPlatform platform, boolean valid, int characterCount, int maxCharacters, List<String> errors, List<String> warnings) {
            this.platform = platform;
            this.valid = valid;
            this.characterCount = characterCount;
            this.maxCharacters = maxCharacters;
            this.errors = errors;
            this.warnings = warnings;
        }

        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public int getCharacterCount() { return characterCount; }
        public void setCharacterCount(int characterCount) { this.characterCount = characterCount; }
        public int getMaxCharacters() { return maxCharacters; }
        public void setMaxCharacters(int maxCharacters) { this.maxCharacters = maxCharacters; }
        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }
}
