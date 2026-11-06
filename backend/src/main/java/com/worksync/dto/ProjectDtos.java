package com.worksync.dto;

import com.worksync.entity.Project;
import com.worksync.entity.ProjectPriority;
import com.worksync.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectDtos {

    public static class ProjectDto {
        private Long id;
        private Long workspaceId;
        private Long teamId;
        private String teamName;
        private Long managerId;
        private String managerName;
        private String title;
        private String description;
        private ProjectStatus status;
        private ProjectPriority priority;
        private LocalDate startDate;
        private LocalDate dueDate;
        private int progressPercentage;
        private LocalDateTime createdAt;
        private long totalTasks;
        private long completedTasks;

        public static ProjectDto fromEntity(Project p) {
            if (p == null) return null;
            ProjectDto dto = new ProjectDto();
            dto.setId(p.getId());
            dto.setWorkspaceId(p.getWorkspace().getId());
            if (p.getTeam() != null) {
                dto.setTeamId(p.getTeam().getId());
                dto.setTeamName(p.getTeam().getName());
            }
            if (p.getManager() != null) {
                dto.setManagerId(p.getManager().getId());
                dto.setManagerName(p.getManager().getFirstName() + " " + p.getManager().getLastName());
            }
            dto.setTitle(p.getTitle());
            dto.setDescription(p.getDescription());
            dto.setStatus(p.getStatus());
            dto.setPriority(p.getPriority());
            dto.setStartDate(p.getStartDate());
            dto.setDueDate(p.getDueDate());
            dto.setProgressPercentage(p.getProgressPercentage());
            dto.setCreatedAt(p.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public Long getTeamId() { return teamId; }
        public void setTeamId(Long teamId) { this.teamId = teamId; }
        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
        public String getManagerName() { return managerName; }
        public void setManagerName(String managerName) { this.managerName = managerName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public ProjectStatus getStatus() { return status; }
        public void setStatus(ProjectStatus status) { this.status = status; }
        public ProjectPriority getPriority() { return priority; }
        public void setPriority(ProjectPriority priority) { this.priority = priority; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public long getTotalTasks() { return totalTasks; }
        public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
        public long getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    }

    public static class ProjectCreateRequest {
        private Long workspaceId;
        private Long teamId;
        private Long managerId;

        @NotBlank(message = "Project title is required")
        private String title;
        private String description;
        private ProjectStatus status = ProjectStatus.PLANNING;
        private ProjectPriority priority = ProjectPriority.MEDIUM;
        private LocalDate startDate;
        private LocalDate dueDate;

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public Long getTeamId() { return teamId; }
        public void setTeamId(Long teamId) { this.teamId = teamId; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public ProjectStatus getStatus() { return status; }
        public void setStatus(ProjectStatus status) { this.status = status; }
        public ProjectPriority getPriority() { return priority; }
        public void setPriority(ProjectPriority priority) { this.priority = priority; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    }
}
