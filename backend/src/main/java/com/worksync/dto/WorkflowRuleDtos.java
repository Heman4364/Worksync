package com.worksync.dto;

import com.worksync.entity.WorkflowRule;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class WorkflowRuleDtos {

    public static class WorkflowRuleDto {
        private Long id;
        private Long workspaceId;
        private String name;
        private String triggerEvent;
        private String conditionJson;
        private String actionType;
        private String actionPayloadJson;
        private boolean enabled;
        private LocalDateTime createdAt;

        public static WorkflowRuleDto fromEntity(WorkflowRule wr) {
            if (wr == null) return null;
            WorkflowRuleDto dto = new WorkflowRuleDto();
            dto.setId(wr.getId());
            dto.setWorkspaceId(wr.getWorkspace().getId());
            dto.setName(wr.getName());
            dto.setTriggerEvent(wr.getTriggerEvent());
            dto.setConditionJson(wr.getConditionJson());
            dto.setActionType(wr.getActionType());
            dto.setActionPayloadJson(wr.getActionPayloadJson());
            dto.setEnabled(wr.isEnabled());
            dto.setCreatedAt(wr.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTriggerEvent() { return triggerEvent; }
        public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }
        public String getConditionJson() { return conditionJson; }
        public void setConditionJson(String conditionJson) { this.conditionJson = conditionJson; }
        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getActionPayloadJson() { return actionPayloadJson; }
        public void setActionPayloadJson(String actionPayloadJson) { this.actionPayloadJson = actionPayloadJson; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class WorkflowRuleCreateRequest {
        private Long workspaceId;
        @NotBlank(message = "Rule name is required")
        private String name;
        @NotBlank(message = "Trigger event is required")
        private String triggerEvent;
        private String conditionJson;
        @NotBlank(message = "Action type is required")
        private String actionType;
        private String actionPayloadJson;
        private boolean enabled = true;

        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTriggerEvent() { return triggerEvent; }
        public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }
        public String getConditionJson() { return conditionJson; }
        public void setConditionJson(String conditionJson) { this.conditionJson = conditionJson; }
        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getActionPayloadJson() { return actionPayloadJson; }
        public void setActionPayloadJson(String actionPayloadJson) { this.actionPayloadJson = actionPayloadJson; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}
