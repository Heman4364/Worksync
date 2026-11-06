package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.NotificationDto;
import com.worksync.security.UserPrincipal;
import com.worksync.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(page = 0, size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificationDto> page = notificationService.getUserNotifications(principal.getId(), pageable);
        long unread = notificationService.getUnreadCount(principal.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", page);
        result.put("unreadCount", unread);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getRecentNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> list = notificationService.getRecentUserNotifications(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}
