package com.worksync.dto;

import com.worksync.entity.Task;
import com.worksync.entity.TaskComment;
import com.worksync.entity.TaskPriority;
import com.worksync.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDtos {

    public static class TaskDto {
        private Long id;
        private Long projectId;
        private String projectTitle;
        private Long assignedToId;
        private String assignedToName;
        private String assignedToAvatar;
        private Long createdById;
        private String createdByName;
        private String title;
        private String description;
        private TaskPriority priority;
        private TaskStatus status;
        private LocalDate startDate;
        private LocalDate dueDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static TaskDto fromEntity(Task t) {
            if (t == null) return null;
            TaskDto dto = new TaskDto();
            dto.setId(t.getId());
            if (t.getProject() != null) {
                dto.setProjectId(t.getProject().getId());
                dto.setProjectTitle(t.getProject().getTitle());
            }
            if (t.getAssignedTo() != null) {
                dto.setAssignedToId(t.getAssignedTo().getId());
                dto.setAssignedToName(t.getAssignedTo().getFirstName() + " " + t.getAssignedTo().getLastName());
                dto.setAssignedToAvatar(t.getAssignedTo().getAvatarUrl());
            }
            if (t.getCreatedBy() != null) {
                dto.setCreatedById(t.getCreatedBy().getId());
                dto.setCreatedByName(t.getCreatedBy().getFirstName() + " " + t.getCreatedBy().getLastName());
            }
            dto.setTitle(t.getTitle());
            dto.setDescription(t.getDescription());
            dto.setPriority(t.getPriority());
            dto.setStatus(t.getStatus());
            dto.setStartDate(t.getStartDate());
            dto.setDueDate(t.getDueDate());
            dto.setCreatedAt(t.getCreatedAt());
            dto.setUpdatedAt(t.getUpdatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectTitle() { return projectTitle; }
        public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
        public String getAssignedToAvatar() { return assignedToAvatar; }
        public void setAssignedToAvatar(String assignedToAvatar) { this.assignedToAvatar = assignedToAvatar; }
        public Long getCreatedById() { return createdById; }
        public void setCreatedById(Long createdById) { this.createdById = createdById; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        public TaskStatus getStatus() { return status; }
        public void setStatus(TaskStatus status) { this.status = status; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class TaskCreateRequest {
        private Long projectId;
        private Long assignedToId;

        @NotBlank(message = "Task title is required")
        private String title;
        private String description;
        private TaskPriority priority = TaskPriority.MEDIUM;
        private TaskStatus status = TaskStatus.TODO;
        private LocalDate startDate;
        private LocalDate dueDate;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        public TaskStatus getStatus() { return status; }
        public void setStatus(TaskStatus status) { this.status = status; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    }

    public static class TaskStatusUpdateRequest {
        private TaskStatus status;

        public TaskStatus getStatus() { return status; }
        public void setStatus(TaskStatus status) { this.status = status; }
    }

    public static class TaskCommentDto {
        private Long id;
        private Long taskId;
        private Long authorId;
        private String authorName;
        private String authorAvatar;
        private String content;
        private LocalDateTime createdAt;

        public static TaskCommentDto fromEntity(TaskComment tc) {
            if (tc == null) return null;
            TaskCommentDto dto = new TaskCommentDto();
            dto.setId(tc.getId());
            dto.setTaskId(tc.getTask().getId());
            dto.setAuthorId(tc.getAuthor().getId());
            dto.setAuthorName(tc.getAuthor().getFirstName() + " " + tc.getAuthor().getLastName());
            dto.setAuthorAvatar(tc.getAuthor().getAvatarUrl());
            dto.setContent(tc.getContent());
            dto.setCreatedAt(tc.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public String getAuthorAvatar() { return authorAvatar; }
        public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class TaskCommentCreateRequest {
        @NotBlank(message = "Comment content cannot be blank")
        private String content;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
