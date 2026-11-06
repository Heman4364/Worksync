package com.worksync.service;

import com.worksync.dto.TaskDtos.*;
import com.worksync.entity.*;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskCommentRepository commentRepository;
    private final ActivityLogService activityLogService;
    private final WorkflowAutomationEngine workflowEngine;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository,
                       TaskCommentRepository commentRepository,
                       ActivityLogService activityLogService,
                       WorkflowAutomationEngine workflowEngine) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.activityLogService = activityLogService;
        this.workflowEngine = workflowEngine;
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getWorkspaceTasks(Long workspaceId, Pageable pageable) {
        return taskRepository.findAllByWorkspaceIdWithDetails(workspaceId, pageable)
                .map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getWorkspaceTasksForKanban(Long workspaceId) {
        return taskRepository.findAllByWorkspaceIdForKanban(workspaceId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getProjectTasks(Long projectId, Pageable pageable) {
        return taskRepository.findByProjectIdWithDetails(projectId, pageable)
                .map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getUserAssignedTasks(Long userId, Pageable pageable) {
        return taskRepository.findByAssignedToIdWithDetails(userId, pageable)
                .map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long id) {
        Task t = taskRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        return TaskDto.fromEntity(t);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "taskStatistics"}, allEntries = true)
    public TaskDto createTask(TaskCreateRequest req, User currentUser) {
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + req.getProjectId()));

        User assignedTo = null;
        if (req.getAssignedToId() != null) {
            assignedTo = userRepository.findById(req.getAssignedToId()).orElse(null);
        }

        Task task = new Task();
        task.setProject(project);
        task.setCreatedBy(currentUser);
        task.setAssignedTo(assignedTo);
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setPriority(req.getPriority() != null ? req.getPriority() : TaskPriority.MEDIUM);
        task.setStatus(req.getStatus() != null ? req.getStatus() : TaskStatus.TODO);
        task.setStartDate(req.getStartDate());
        task.setDueDate(req.getDueDate());

        task = taskRepository.save(task);

        activityLogService.logActivity(project.getWorkspace(), currentUser, "CREATE", "TASK", task.getId(), null, task.getTitle());

        if (assignedTo != null) {
            workflowEngine.triggerEvent("TASK_ASSIGNED", project.getWorkspace().getId(), task);
        }

        updateProjectProgress(project);

        return TaskDto.fromEntity(task);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "taskStatistics"}, allEntries = true)
    public TaskDto updateTask(Long id, TaskCreateRequest req, User currentUser) {
        Task task = taskRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        String oldTitle = task.getTitle();
        Long oldAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        task.setStartDate(req.getStartDate());
        task.setDueDate(req.getDueDate());

        if (req.getAssignedToId() != null) {
            userRepository.findById(req.getAssignedToId()).ifPresent(task::setAssignedTo);
        } else {
            task.setAssignedTo(null);
        }

        task = taskRepository.save(task);

        activityLogService.logActivity(task.getProject().getWorkspace(), currentUser, "UPDATE", "TASK", task.getId(), oldTitle, task.getTitle());

        // Check if reassigned
        Long newAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        if (newAssigneeId != null && !newAssigneeId.equals(oldAssigneeId)) {
            workflowEngine.triggerEvent("TASK_ASSIGNED", task.getProject().getWorkspace().getId(), task);
        }

        updateProjectProgress(task.getProject());

        return TaskDto.fromEntity(task);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "taskStatistics"}, allEntries = true)
    public TaskDto updateTaskStatus(Long id, TaskStatus newStatus, User currentUser) {
        Task task = taskRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(newStatus);
        task = taskRepository.save(task);

        activityLogService.logActivity(task.getProject().getWorkspace(), currentUser, "STATUS_CHANGE", "TASK",
                task.getId(), oldStatus.name(), newStatus.name());

        if (newStatus == TaskStatus.COMPLETED) {
            workflowEngine.triggerEvent("TASK_COMPLETED", task.getProject().getWorkspace().getId(), task);
        }

        updateProjectProgress(task.getProject());

        return TaskDto.fromEntity(task);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "taskStatistics"}, allEntries = true)
    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        Project p = task.getProject();
        activityLogService.logActivity(p.getWorkspace(), currentUser, "DELETE", "TASK", id, task.getTitle(), null);
        taskRepository.delete(task);

        updateProjectProgress(p);
    }

    @Transactional(readOnly = true)
    public List<TaskCommentDto> getTaskComments(Long taskId) {
        return commentRepository.findByTaskIdWithAuthor(taskId).stream()
                .map(TaskCommentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskCommentDto addComment(Long taskId, String content, User author) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        TaskComment comment = new TaskComment(task, author, content);
        comment = commentRepository.save(comment);

        activityLogService.logActivity(task.getProject().getWorkspace(), author, "COMMENT", "TASK", task.getId(), null, content);

        return TaskCommentDto.fromEntity(comment);
    }

    private void updateProjectProgress(Project project) {
        long total = taskRepository.countByProjectId(project.getId());
        if (total == 0) {
            project.setProgressPercentage(0);
        } else {
            long completed = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.COMPLETED);
            int percentage = (int) Math.round(((double) completed / total) * 100);
            project.setProgressPercentage(percentage);
        }
        projectRepository.save(project);
    }
}
