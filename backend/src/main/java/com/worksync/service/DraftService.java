package com.worksync.service;

import com.worksync.dto.DraftDtos.*;
import com.worksync.entity.Draft;
import com.worksync.entity.SocialPlatform;
import com.worksync.entity.User;
import com.worksync.entity.Workspace;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.DraftRepository;
import com.worksync.repository.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DraftService {

    private final DraftRepository draftRepository;
    private final WorkspaceRepository workspaceRepository;

    public DraftService(DraftRepository draftRepository, WorkspaceRepository workspaceRepository) {
        this.draftRepository = draftRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @Transactional
    public DraftDto createDraft(DraftCreateRequest req, User user) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        Draft draft = new Draft(ws, user, req.getPlatform(), req.getTitle(), req.getContent(), req.getTags());
        draft = draftRepository.save(draft);
        return DraftDto.fromEntity(draft);
    }

    @Transactional
    public DraftDto updateDraft(Long id, DraftCreateRequest req) {
        Draft draft = draftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + id));

        draft.setPlatform(req.getPlatform());
        draft.setTitle(req.getTitle());
        draft.setContent(req.getContent());
        draft.setTags(req.getTags());

        draft = draftRepository.save(draft);
        return DraftDto.fromEntity(draft);
    }

    @Transactional(readOnly = true)
    public Page<DraftDto> getDrafts(Long workspaceId, SocialPlatform platform, String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return draftRepository.searchDrafts(workspaceId, query, pageable)
                    .map(DraftDto::fromEntity);
        } else if (platform != null) {
            return draftRepository.findByWorkspaceIdAndPlatform(workspaceId, platform, pageable)
                    .map(DraftDto::fromEntity);
        } else {
            return draftRepository.findByWorkspaceId(workspaceId, pageable)
                    .map(DraftDto::fromEntity);
        }
    }

    @Transactional(readOnly = true)
    public DraftDto getDraftById(Long id) {
        Draft draft = draftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + id));
        return DraftDto.fromEntity(draft);
    }

    @Transactional
    public void deleteDraft(Long id) {
        Draft draft = draftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + id));
        draftRepository.delete(draft);
    }
}
