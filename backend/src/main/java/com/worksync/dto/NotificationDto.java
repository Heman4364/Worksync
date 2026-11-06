package com.worksync.dto;

import com.worksync.entity.Notification;
import com.worksync.entity.NotificationCategory;
import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationCategory category;
    private boolean readStatus;
    private String linkUrl;
    private LocalDateTime createdAt;

    public static NotificationDto fromEntity(Notification n) {
        if (n == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setUserId(n.getUser().getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setCategory(n.getCategory());
        dto.setReadStatus(n.isReadStatus());
        dto.setLinkUrl(n.getLinkUrl());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }
    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }
    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
