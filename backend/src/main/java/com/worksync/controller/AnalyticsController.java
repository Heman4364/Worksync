package com.worksync.controller;

import com.worksync.dto.AnalyticsDashboardDto;
import com.worksync.dto.ApiResponse;
import com.worksync.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsDashboardDto>> getDashboardAnalytics(@RequestParam Long workspaceId) {
        AnalyticsDashboardDto dto = analyticsService.getDashboardAnalytics(workspaceId);
        return ResponseEntity.ok(ApiResponse.success(dto, "Dashboard analytics retrieved successfully"));
    }
}
