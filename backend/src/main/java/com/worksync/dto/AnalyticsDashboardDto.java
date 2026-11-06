package com.worksync.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDashboardDto {

    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long totalTasks;
    private long pendingTasks;
    private long completedTasks;
    private long overdueTasks;
    private double taskCompletionRate;
    private long contentPostsCreated;
    private long scheduledPosts;
    private long draftCount;
    private Map<String, Long> postsByStatus;
    private Map<String, Long> postsByPlatform;
    private List<Map<String, Object>> weeklyProductivity;
    private List<Map<String, Object>> projectProgressOverview;
    private List<Map<String, Object>> teamPerformance;
    private List<ActivityLogDto> recentActivity;
    private List<TaskDtos.TaskDto> upcomingDeadlines;

    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
    public long getActiveProjects() { return activeProjects; }
    public void setActiveProjects(long activeProjects) { this.activeProjects = activeProjects; }
    public long getCompletedProjects() { return completedProjects; }
    public void setCompletedProjects(long completedProjects) { this.completedProjects = completedProjects; }
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public long getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(long pendingTasks) { this.pendingTasks = pendingTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
    public double getTaskCompletionRate() { return taskCompletionRate; }
    public void setTaskCompletionRate(double taskCompletionRate) { this.taskCompletionRate = taskCompletionRate; }
    public long getContentPostsCreated() { return contentPostsCreated; }
    public void setContentPostsCreated(long contentPostsCreated) { this.contentPostsCreated = contentPostsCreated; }
    public long getScheduledPosts() { return scheduledPosts; }
    public void setScheduledPosts(long scheduledPosts) { this.scheduledPosts = scheduledPosts; }
    public long getDraftCount() { return draftCount; }
    public void setDraftCount(long draftCount) { this.draftCount = draftCount; }
    public Map<String, Long> getPostsByStatus() { return postsByStatus; }
    public void setPostsByStatus(Map<String, Long> postsByStatus) { this.postsByStatus = postsByStatus; }
    public Map<String, Long> getPostsByPlatform() { return postsByPlatform; }
    public void setPostsByPlatform(Map<String, Long> postsByPlatform) { this.postsByPlatform = postsByPlatform; }
    public List<Map<String, Object>> getWeeklyProductivity() { return weeklyProductivity; }
    public void setWeeklyProductivity(List<Map<String, Object>> weeklyProductivity) { this.weeklyProductivity = weeklyProductivity; }
    public List<Map<String, Object>> getProjectProgressOverview() { return projectProgressOverview; }
    public void setProjectProgressOverview(List<Map<String, Object>> projectProgressOverview) { this.projectProgressOverview = projectProgressOverview; }
    public List<Map<String, Object>> getTeamPerformance() { return teamPerformance; }
    public void setTeamPerformance(List<Map<String, Object>> teamPerformance) { this.teamPerformance = teamPerformance; }
    public List<ActivityLogDto> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ActivityLogDto> recentActivity) { this.recentActivity = recentActivity; }
    public List<TaskDtos.TaskDto> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<TaskDtos.TaskDto> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }
}
