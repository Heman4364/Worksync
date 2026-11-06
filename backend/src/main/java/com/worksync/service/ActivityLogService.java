package com.worksync.service;

import com.worksync.dto.ActivityLogDto;
import com.worksync.entity.ActivityLog;
import com.worksync.entity.User;
import com.worksync.entity.Workspace;
import com.worksync.repository.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public void logActivity(Workspace workspace, User user, String actionType, String entityType, Long entityId, String previousValue, String newValue) {
        ActivityLog log = new ActivityLog(workspace, user, actionType, entityType, entityId, previousValue, newValue);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogDto> getActivityLogs(Long workspaceId, Pageable pageable) {
        return activityLogRepository.findByWorkspaceIdWithUser(workspaceId, pageable)
                .map(ActivityLogDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getRecentActivities(Long workspaceId) {
        return activityLogRepository.findTop15ByWorkspaceIdWithUser(workspaceId).stream()
                .map(ActivityLogDto::fromEntity)
                .collect(Collectors.toList());
    }
}
