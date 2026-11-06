package com.worksync.dto;

import com.worksync.entity.CalendarEvent;
import com.worksync.entity.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CalendarEventDtos {

    public static class CalendarEventDto {
        private Long id;
        private Long workspaceId;
        private Long userId;
        private String userName;
        private String title;
        private String description;
        private EventType eventType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long referenceId;
        private String color;
        private boolean allDay;
        private LocalDateTime createdAt;

        public static CalendarEventDto fromEntity(CalendarEvent ce) {
            if (ce == null) return null;
            CalendarEventDto dto = new CalendarEventDto();
            dto.setId(ce.getId());
            dto.setWorkspaceId(ce.getWorkspace().getId());
            if (ce.getUser() != null) {
                dto.setUserId(ce.getUser().getId());
                dto.setUserName(ce.getUser().getFirstName() + " " + ce.getUser().getLastName());
            }
            dto.setTitle(ce.getTitle());
            dto.setDescription(ce.getDescription());
            dto.setEventType(ce.getEventType());
            dto.setStartTime(ce.getStartTime());
            dto.setEndTime(ce.getEndTime());
            dto.setReferenceId(ce.getReferenceId());
            dto.setColor(ce.getColor());
            dto.setAllDay(ce.isAllDay());
            dto.setCreatedAt(ce.getCreatedAt());
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
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public EventType getEventType() { return eventType; }
        public void setEventType(EventType eventType) { this.eventType = eventType; }
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public Long getReferenceId() { return referenceId; }
        public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        public boolean isAllDay() { return allDay; }
        public void setAllDay(boolean allDay) { this.allDay = allDay; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class CalendarEventCreateRequest {
        private Long workspaceId;
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        private EventType eventType = EventType.CUSTOM;
        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long referenceId;
        private String color = "#6366f1";
        private boolean allDay = false;

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public EventType getEventType() { return eventType; }
        public void setEventType(EventType eventType) { this.eventType = eventType; }
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public Long getReferenceId() { return referenceId; }
        public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        public boolean isAllDay() { return allDay; }
        public void setAllDay(boolean allDay) { this.allDay = allDay; }
    }
}
