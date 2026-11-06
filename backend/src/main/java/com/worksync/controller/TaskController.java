package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.TaskDtos.*;
import com.worksync.entity.User;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.UserRepository;
import com.worksync.security.UserPrincipal;
import com.worksync.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskDto>>> getTasks(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assignedToId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<TaskDto> page;
        if (projectId != null) {
            page = taskService.getProjectTasks(projectId, pageable);
        } else if (assignedToId != null) {
            page = taskService.getUserAssignedTasks(assignedToId, pageable);
        } else if (workspaceId != null) {
            page = taskService.getWorkspaceTasks(workspaceId, pageable);
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Either workspaceId, projectId, or assignedToId must be provided"));
        }

        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/kanban")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getKanbanTasks(@RequestParam Long workspaceId) {
        List<TaskDto> tasks = taskService.getWorkspaceTasksForKanban(workspaceId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TaskDto task = taskService.createTask(request, user);
        return ResponseEntity.ok(ApiResponse.success(task, "Task created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TaskDto task = taskService.updateTask(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(task, "Task updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDto>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody TaskStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TaskDto task = taskService.updateTaskStatus(id, request.getStatus(), user);
        return ResponseEntity.ok(ApiResponse.success(task, "Task status updated to " + request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<TaskCommentDto>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskComments(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TaskCommentDto>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TaskCommentCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TaskCommentDto comment = taskService.addComment(id, request.getContent(), user);
        return ResponseEntity.ok(ApiResponse.success(comment, "Comment added successfully"));
    }
}
