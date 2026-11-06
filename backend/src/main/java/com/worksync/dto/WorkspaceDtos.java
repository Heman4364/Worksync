package com.worksync.dto;

import com.worksync.entity.Role;
import com.worksync.entity.Workspace;
import com.worksync.entity.WorkspaceMember;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class WorkspaceDtos {

    public static class WorkspaceDto {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private Long ownerId;
        private String ownerName;
        private LocalDateTime createdAt;

        public static WorkspaceDto fromEntity(Workspace w) {
            if (w == null) return null;
            WorkspaceDto dto = new WorkspaceDto();
            dto.setId(w.getId());
            dto.setName(w.getName());
            dto.setSlug(w.getSlug());
            dto.setDescription(w.getDescription());
            if (w.getOwner() != null) {
                dto.setOwnerId(w.getOwner().getId());
                dto.setOwnerName(w.getOwner().getFirstName() + " " + w.getOwner().getLastName());
            }
            dto.setCreatedAt(w.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class WorkspaceCreateRequest {
        @NotBlank(message = "Workspace name is required")
        private String name;
        private String slug;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class WorkspaceMemberDto {
        private Long id;
        private Long workspaceId;
        private Long userId;
        private String userEmail;
        private String userName;
        private String userAvatar;
        private Role role;
        private LocalDateTime joinedAt;

        public static WorkspaceMemberDto fromEntity(WorkspaceMember wm) {
            if (wm == null) return null;
            WorkspaceMemberDto dto = new WorkspaceMemberDto();
            dto.setId(wm.getId());
            dto.setWorkspaceId(wm.getWorkspace().getId());
            dto.setUserId(wm.getUser().getId());
            dto.setUserEmail(wm.getUser().getEmail());
            dto.setUserName(wm.getUser().getFirstName() + " " + wm.getUser().getLastName());
            dto.setUserAvatar(wm.getUser().getAvatarUrl());
            dto.setRole(wm.getRole());
            dto.setJoinedAt(wm.getJoinedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserAvatar() { return userAvatar; }
        public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class WorkspaceMemberInviteRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;
        private Role role = Role.ROLE_MEMBER;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }
}
