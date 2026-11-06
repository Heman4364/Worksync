package com.worksync.dto;

import com.worksync.entity.ActivityLog;
import java.time.LocalDateTime;

public class ActivityLogDto {
    private Long id;
    private Long workspaceId;
    private Long userId;
    private String userName;
    private String actionType;
    private String entityType;
    private Long entityId;
    private String previousValue;
    private String newValue;
    private LocalDateTime timestamp;

    public static ActivityLogDto fromEntity(ActivityLog a) {
        if (a == null) return null;
        ActivityLogDto dto = new ActivityLogDto();
        dto.setId(a.getId());
        if (a.getWorkspace() != null) {
            dto.setWorkspaceId(a.getWorkspace().getId());
        }
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserName(a.getUser().getFirstName() + " " + a.getUser().getLastName());
        }
        dto.setActionType(a.getActionType());
        dto.setEntityType(a.getEntityType());
        dto.setEntityId(a.getEntityId());
        dto.setPreviousValue(a.getPreviousValue());
        dto.setNewValue(a.getNewValue());
        dto.setTimestamp(a.getTimestamp());
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
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String previousValue) { this.previousValue = previousValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
