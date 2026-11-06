package com.worksync.repository;

import com.worksync.entity.WorkflowRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowRuleRepository extends JpaRepository<WorkflowRule, Long> {
    List<WorkflowRule> findByWorkspaceId(Long workspaceId);
    List<WorkflowRule> findByWorkspaceIdAndEnabledTrue(Long workspaceId);
    List<WorkflowRule> findByTriggerEventAndEnabledTrue(String triggerEvent);
}
