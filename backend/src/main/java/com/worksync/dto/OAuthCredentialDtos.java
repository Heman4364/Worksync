package com.worksync.dto;

import com.worksync.entity.OAuthCredential;
import com.worksync.entity.SocialPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class OAuthCredentialDtos {

    public static class OAuthCredentialDto {
        private Long id;
        private Long workspaceId;
        private SocialPlatform platform;
        private String clientId;
        private boolean hasSecret;
        private boolean hasToken;
        private boolean active;
        private LocalDateTime updatedAt;

        public static OAuthCredentialDto fromEntity(OAuthCredential cred) {
            if (cred == null) return null;
            OAuthCredentialDto dto = new OAuthCredentialDto();
            dto.setId(cred.getId());
            dto.setWorkspaceId(cred.getWorkspace().getId());
            dto.setPlatform(cred.getPlatform());
            dto.setClientId(cred.getClientId());
            dto.setHasSecret(cred.getEncryptedClientSecret() != null && !cred.getEncryptedClientSecret().isEmpty());
            dto.setHasToken(cred.getEncryptedAccessToken() != null && !cred.getEncryptedAccessToken().isEmpty());
            dto.setActive(cred.isActive());
            dto.setUpdatedAt(cred.getUpdatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }
        public boolean isHasSecret() { return hasSecret; }
        public void setHasSecret(boolean hasSecret) { this.hasSecret = hasSecret; }
        public boolean isHasToken() { return hasToken; }
        public void setHasToken(boolean hasToken) { this.hasToken = hasToken; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class OAuthCredentialSaveRequest {
        private Long workspaceId;
        @NotNull(message = "Platform is required")
        private SocialPlatform platform;
        @NotBlank(message = "Client ID is required")
        private String clientId;
        @NotBlank(message = "Client Secret is required")
        private String clientSecret;
        private String accessToken;

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public SocialPlatform getPlatform() { return platform; }
        public void setPlatform(SocialPlatform platform) { this.platform = platform; }
        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }
        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    }
}
