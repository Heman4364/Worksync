package com.worksync.service;

import com.worksync.dto.WorkflowRuleDtos.WorkflowRuleCreateRequest;
import com.worksync.dto.WorkflowRuleDtos.WorkflowRuleDto;
import com.worksync.entity.*;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.ProjectRepository;
import com.worksync.repository.TaskRepository;
import com.worksync.repository.WorkflowRuleRepository;
import com.worksync.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkflowAutomationEngine {

    private static final Logger log = LoggerFactory.getLogger(WorkflowAutomationEngine.class);

    private final WorkflowRuleRepository workflowRuleRepository;
    private final WorkspaceRepository workspaceRepository;
    private final NotificationService notificationService;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public WorkflowAutomationEngine(WorkflowRuleRepository workflowRuleRepository,
                                    WorkspaceRepository workspaceRepository,
                                    NotificationService notificationService,
                                    TaskRepository taskRepository,
                                    ProjectRepository projectRepository) {
        this.workflowRuleRepository = workflowRuleRepository;
        this.workspaceRepository = workspaceRepository;
        this.notificationService = notificationService;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public void triggerEvent(String triggerEvent, Long workspaceId, Object context) {
        log.info("Evaluating workflow automation rules for trigger: [{}] in workspace: [{}]", triggerEvent, workspaceId);

        List<WorkflowRule> rules = workflowRuleRepository.findByWorkspaceIdAndEnabledTrue(workspaceId).stream()
                .filter(r -> triggerEvent.equalsIgnoreCase(r.getTriggerEvent()))
                .collect(Collectors.toList());

        for (WorkflowRule rule : rules) {
            try {
                executeRule(rule, context);
            } catch (Exception e) {
                log.error("Failed to execute workflow rule id: {} ({}): {}", rule.getId(), rule.getName(), e.getMessage());
            }
        }
    }

    private void executeRule(WorkflowRule rule, Object context) {
        log.info("Executing workflow rule: [{}] Action: [{}]", rule.getName(), rule.getActionType());

        if (context instanceof Task task) {
            if ("NOTIFY_ASSIGNEE".equalsIgnoreCase(rule.getActionType()) && task.getAssignedTo() != null) {
                notificationService.createNotification(
                        task.getAssignedTo().getId(),
                        "Task Assignment: " + task.getTitle(),
                        "You have been assigned to task: " + task.getTitle() + " (Priority: " + task.getPriority() + ")",
                        NotificationCategory.TASK,
                        "/tasks"
                );
            } else if ("NOTIFY_MANAGER".equalsIgnoreCase(rule.getActionType())) {
                if (task.getProject().getManager() != null) {
                    notificationService.createNotification(
                            task.getProject().getManager().getId(),
                            "Task Status Update: " + task.getTitle(),
                            "Task '" + task.getTitle() + "' in project '" + task.getProject().getTitle() + "' status changed to: " + task.getStatus(),
                            NotificationCategory.TASK,
                            "/tasks"
                    );
                }

                // If task completed, check if all tasks are completed
                if (task.getStatus() == TaskStatus.COMPLETED) {
                    long totalTasks = taskRepository.countByProjectId(task.getProject().getId());
                    long completedTasks = taskRepository.countByProjectIdAndStatus(task.getProject().getId(), TaskStatus.COMPLETED);
                    if (totalTasks > 0 && totalTasks == completedTasks) {
                        Project project = task.getProject();
                        project.setProgressPercentage(100);
                        project.setStatus(ProjectStatus.COMPLETED);
                        projectRepository.save(project);

                        if (project.getManager() != null) {
                            notificationService.createNotification(
                                    project.getManager().getId(),
                                    "Project Ready for Completion: " + project.getTitle(),
                                    "All tasks in project '" + project.getTitle() + "' have been completed successfully!",
                                    NotificationCategory.PROJECT,
                                    "/projects"
                            );
                        }
                    }
                }
            }
        } else if (context instanceof SocialPost post) {
            if ("NOTIFY_POST_FAILURE".equalsIgnoreCase(rule.getActionType())) {
                notificationService.createNotification(
                        post.getAuthor().getId(),
                        "Social Post Publishing Failed",
                        "Scheduled post on " + post.getPlatform() + " failed: " + post.getFailureReason(),
                        NotificationCategory.CONTENT,
                        "/kafka-reliability"
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<WorkflowRuleDto> getRules(Long workspaceId) {
        return workflowRuleRepository.findByWorkspaceId(workspaceId).stream()
                .map(WorkflowRuleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkflowRuleDto createRule(WorkflowRuleCreateRequest req) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        WorkflowRule rule = new WorkflowRule(
                ws,
                req.getName(),
                req.getTriggerEvent(),
                req.getConditionJson(),
                req.getActionType(),
                req.getActionPayloadJson(),
                req.isEnabled()
        );
        rule = workflowRuleRepository.save(rule);
        return WorkflowRuleDto.fromEntity(rule);
    }

    @Transactional
    public WorkflowRuleDto toggleRule(Long ruleId) {
        WorkflowRule rule = workflowRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));
        rule.setEnabled(!rule.isEnabled());
        rule = workflowRuleRepository.save(rule);
        return WorkflowRuleDto.fromEntity(rule);
    }
}
