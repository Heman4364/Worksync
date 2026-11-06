package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.WorkflowRuleDtos.*;
import com.worksync.service.WorkflowAutomationEngine;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automations")
public class WorkflowController {

    private final WorkflowAutomationEngine workflowEngine;

    public WorkflowController(WorkflowAutomationEngine workflowEngine) {
        this.workflowEngine = workflowEngine;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowRuleDto>>> getRules(@RequestParam Long workspaceId) {
        List<WorkflowRuleDto> rules = workflowEngine.getRules(workspaceId);
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowRuleDto>> createRule(@Valid @RequestBody WorkflowRuleCreateRequest request) {
        WorkflowRuleDto rule = workflowEngine.createRule(request);
        return ResponseEntity.ok(ApiResponse.success(rule, "Automation rule configured successfully"));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowRuleDto>> toggleRule(@PathVariable Long id) {
        WorkflowRuleDto rule = workflowEngine.toggleRule(id);
        return ResponseEntity.ok(ApiResponse.success(rule, "Automation rule status updated"));
    }
}
