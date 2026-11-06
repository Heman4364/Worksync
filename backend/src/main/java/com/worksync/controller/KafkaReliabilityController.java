package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.KafkaDtos.*;
import com.worksync.kafka.KafkaReliabilityEngine;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class KafkaReliabilityController {

    private final KafkaReliabilityEngine kafkaEngine;

    public KafkaReliabilityController(KafkaReliabilityEngine kafkaEngine) {
        this.kafkaEngine = kafkaEngine;
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<KafkaEventDto>> publishEvent(@Valid @RequestBody KafkaEventPublishRequest request) {
        KafkaEventDto dto = kafkaEngine.publishEvent(request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Event published to Kafka reliability subsystem"));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<Page<KafkaEventDto>>> getEvents(
            @PageableDefault(page = 0, size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getEvents(pageable)));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<KafkaEventDto>> getEventById(@PathVariable String eventId) {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getEventById(eventId)));
    }

    @GetMapping("/dlq")
    public ResponseEntity<ApiResponse<Page<DeadLetterDto>>> getDlqRecords(
            @PageableDefault(page = 0, size = 15, sort = "routedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getDlqRecords(pageable)));
    }

    @PostMapping("/events/{eventId}/retry")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<KafkaEventDto>> retryDlqEvent(@PathVariable String eventId) {
        KafkaEventDto dto = kafkaEngine.reprocessDlqEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(dto, "DLQ event reprocessing triggered with original eventId [" + eventId + "]"));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<ProcessingLogDto>>> getProcessingLogs(
            @PageableDefault(page = 0, size = 30, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getProcessingLogs(pageable)));
    }

    @PostMapping("/logs/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> clearProcessingLogs() {
        kafkaEngine.clearProcessingLogs();
        return ResponseEntity.ok(ApiResponse.success(null, "Kafka processing logs cleared"));
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<KafkaRetryConfigDto>> getRetryConfig() {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getRetryConfig()));
    }

    @PostMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<KafkaRetryConfigDto>> updateRetryConfig(@RequestBody KafkaRetryConfigDto newConfig) {
        KafkaRetryConfigDto updated = kafkaEngine.updateRetryConfig(newConfig);
        return ResponseEntity.ok(ApiResponse.success(updated, "Kafka retry parameters updated dynamically"));
    }

    @PostMapping("/tests/run")
    public ResponseEntity<ApiResponse<KafkaTestReportDto>> runAutomatedTests(@RequestBody(required = false) KafkaTestRequestDto request) {
        String scenario = (request != null && request.getScenario() != null) ? request.getScenario() : "ALL";
        KafkaTestReportDto report = kafkaEngine.runAutomatedTests(scenario);
        return ResponseEntity.ok(ApiResponse.success(report, "Kafka reliability test execution completed"));
    }

    @GetMapping("/tests/report")
    public ResponseEntity<ApiResponse<KafkaTestReportDto>> getLatestTestReport() {
        return ResponseEntity.ok(ApiResponse.success(kafkaEngine.getLatestTestReport()));
    }

    @PostMapping("/tests/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> clearTestReport() {
        kafkaEngine.clearTestReport();
        return ResponseEntity.ok(ApiResponse.success(null, "Kafka test report cleared"));
    }
}
