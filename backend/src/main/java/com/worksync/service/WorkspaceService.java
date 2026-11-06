package com.worksync.service;

import com.worksync.dto.WorkspaceDtos.*;
import com.worksync.entity.Role;
import com.worksync.entity.User;
import com.worksync.entity.Workspace;
import com.worksync.entity.WorkspaceMember;
import com.worksync.exception.BadRequestException;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.UserRepository;
import com.worksync.repository.WorkspaceMemberRepository;
import com.worksync.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository workspaceMemberRepository,
                            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(Long userId) {
        return workspaceMemberRepository.findByUserIdWithWorkspace(userId).stream()
                .map(wm -> WorkspaceDto.fromEntity(wm.getWorkspace()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspaceById(Long id) {
        Workspace ws = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + id));
        return WorkspaceDto.fromEntity(ws);
    }

    @Transactional
    public WorkspaceDto createWorkspace(WorkspaceCreateRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerId));

        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 5);
        }

        Workspace ws = new Workspace(request.getName(), slug, request.getDescription(), owner);
        ws = workspaceRepository.save(ws);

        WorkspaceMember member = new WorkspaceMember(ws, owner, Role.ROLE_ADMIN);
        workspaceMemberRepository.save(member);

        return WorkspaceDto.fromEntity(ws);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> getWorkspaceMembers(Long workspaceId) {
        return workspaceMemberRepository.findByWorkspaceIdWithUser(workspaceId).stream()
                .map(WorkspaceMemberDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceMemberDto inviteMember(Long workspaceId, WorkspaceMemberInviteRequest request) {
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        if (workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.getId()).isPresent()) {
            throw new BadRequestException("User is already a member of this workspace");
        }

        WorkspaceMember wm = new WorkspaceMember(ws, user, request.getRole());
        wm = workspaceMemberRepository.save(wm);
        return WorkspaceMemberDto.fromEntity(wm);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long userId) {
        WorkspaceMember wm = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));
        workspaceMemberRepository.delete(wm);
    }
}
