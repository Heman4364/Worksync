package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.WorkspaceDtos.*;
import com.worksync.security.UserPrincipal;
import com.worksync.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceDto>>> getMyWorkspaces(@AuthenticationPrincipal UserPrincipal principal) {
        List<WorkspaceDto> list = workspaceService.getUserWorkspaces(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceDto>> getWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(workspaceService.getWorkspaceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceDto>> createWorkspace(@Valid @RequestBody WorkspaceCreateRequest request,
                                                                     @AuthenticationPrincipal UserPrincipal principal) {
        WorkspaceDto dto = workspaceService.createWorkspace(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dto, "Workspace created successfully"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberDto>>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(workspaceService.getWorkspaceMembers(id)));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkspaceMemberDto>> inviteMember(@PathVariable Long id,
                                                                        @Valid @RequestBody WorkspaceMemberInviteRequest request) {
        WorkspaceMemberDto member = workspaceService.inviteMember(id, request);
        return ResponseEntity.ok(ApiResponse.success(member, "Member invited successfully"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        workspaceService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed from workspace"));
    }
}
