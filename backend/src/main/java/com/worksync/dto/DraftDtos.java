package com.worksync.dto;

import com.worksync.entity.Draft;
import com.worksync.entity.SocialPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class DraftDtos {

    public static class DraftDto {
        private Long id;
        private Long workspaceId;
        private Long userId;
        private String userName;
        private SocialPlatform platform;
        private String title;
        private String content;
        private String tags;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static DraftDto fromEntity(Draft d) {
            if (d == null) return null;
            DraftDto dto = new DraftDto();
            dto.setId(d.getId());
            dto.setWorkspaceId(d.getWorkspace().getId());
            if (d.getUser() != null) {
                dto.setUserId(d.getUser().getId());
                dto.setUserName(d.getUser().getFirstName() + " " + d.getUser().getLastName());
            }
            dto.setPlatform(d.getPlatform());
            dto.setTitle(d.getTitle());
            dto.setContent(d.getContent());
            dto.setTags(d.getTags());
            dto.setCreatedAt(d.getCreatedAt());
            dto.setUpdatedAt(d.getUpdatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class DraftCreateRequest {
        private Long workspaceId;
        @NotNull(message = "Platform is required")
        private SocialPlatform platform;
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Content is required")
        private String content;
        private String tags;

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }
    }
}
