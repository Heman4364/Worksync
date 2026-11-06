package com.worksync.dto;

import com.worksync.entity.DeadLetterRecord;
import com.worksync.entity.KafkaEventRecord;
import com.worksync.entity.ProcessingLog;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class KafkaDtos {

    public static class KafkaEventDto {
        private Long id;
        private String eventId;
        private String topic;
        private String payloadJson;
        private String status;
        private int attemptCount;
        private String failureReason;
        private String simulationMode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static KafkaEventDto fromEntity(KafkaEventRecord record) {
            if (record == null) return null;
            KafkaEventDto dto = new KafkaEventDto();
            dto.setId(record.getId());
            dto.setEventId(record.getEventId());
            dto.setTopic(record.getTopic());
            dto.setPayloadJson(record.getPayloadJson());
            dto.setStatus(record.getStatus());
            dto.setAttemptCount(record.getAttemptCount());
            dto.setFailureReason(record.getFailureReason());
            dto.setSimulationMode(record.getSimulationMode());
            dto.setCreatedAt(record.getCreatedAt());
            dto.setUpdatedAt(record.getUpdatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getPayloadJson() { return payloadJson; }
        public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getAttemptCount() { return attemptCount; }
        public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
        public String getSimulationMode() { return simulationMode; }
        public void setSimulationMode(String simulationMode) { this.simulationMode = simulationMode; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class DeadLetterDto {
        private Long id;
        private String eventId;
        private String originalTopic;
        private String errorMessage;
        private String stackTrace;
        private LocalDateTime routedAt;
        private LocalDateTime reprocessedAt;
        private boolean reprocessed;

        public static DeadLetterDto fromEntity(DeadLetterRecord record) {
            if (record == null) return null;
            DeadLetterDto dto = new DeadLetterDto();
            dto.setId(record.getId());
            dto.setEventId(record.getEventId());
            dto.setOriginalTopic(record.getOriginalTopic());
            dto.setErrorMessage(record.getErrorMessage());
            dto.setStackTrace(record.getStackTrace());
            dto.setRoutedAt(record.getRoutedAt());
            dto.setReprocessedAt(record.getReprocessedAt());
            dto.setReprocessed(record.isReprocessed());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getOriginalTopic() { return originalTopic; }
        public void setOriginalTopic(String originalTopic) { this.originalTopic = originalTopic; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getStackTrace() { return stackTrace; }
        public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
        public LocalDateTime getRoutedAt() { return routedAt; }
        public void setRoutedAt(LocalDateTime routedAt) { this.routedAt = routedAt; }
        public LocalDateTime getReprocessedAt() { return reprocessedAt; }
        public void setReprocessedAt(LocalDateTime reprocessedAt) { this.reprocessedAt = reprocessedAt; }
        public boolean isReprocessed() { return reprocessed; }
        public void setReprocessed(boolean reprocessed) { this.reprocessed = reprocessed; }
    }

    public static class ProcessingLogDto {
        private Long id;
        private String eventId;
        private int attemptNumber;
        private String message;
        private long delayMs;
        private String status;
        private LocalDateTime timestamp;

        public static ProcessingLogDto fromEntity(ProcessingLog log) {
            if (log == null) return null;
            ProcessingLogDto dto = new ProcessingLogDto();
            dto.setId(log.getId());
            dto.setEventId(log.getEventId());
            dto.setAttemptNumber(log.getAttemptNumber());
            dto.setMessage(log.getMessage());
            dto.setDelayMs(log.getDelayMs());
            dto.setStatus(log.getStatus());
            dto.setTimestamp(log.getTimestamp());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public int getAttemptNumber() { return attemptNumber; }
        public void setAttemptNumber(int attemptNumber) { this.attemptNumber = attemptNumber; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public long getDelayMs() { return delayMs; }
        public void setDelayMs(long delayMs) { this.delayMs = delayMs; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class KafkaEventPublishRequest {
        private String eventId;
        private String topic = "scheduled-posts";
        @NotBlank(message = "Payload is required")
        private String payload;
        private String simulationMode = "NONE"; // NONE, TEMPORARY, PERMANENT, DUPLICATE

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getPayload() { return payload; }
        public void setPayload(String payload) { this.payload = payload; }
        public String getSimulationMode() { return simulationMode; }
        public void setSimulationMode(String simulationMode) { this.simulationMode = simulationMode; }
    }

    public static class KafkaRetryConfigDto {
        private int maxAttempts;
        private long initialIntervalMs;
        private double multiplier;

        public KafkaRetryConfigDto() {}

        public KafkaRetryConfigDto(int maxAttempts, long initialIntervalMs, double multiplier) {
            this.maxAttempts = maxAttempts;
            this.initialIntervalMs = initialIntervalMs;
            this.multiplier = multiplier;
        }

        public int getMaxAttempts() { return maxAttempts; }
        public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }
        public long getInitialIntervalMs() { return initialIntervalMs; }
        public void setInitialIntervalMs(long initialIntervalMs) { this.initialIntervalMs = initialIntervalMs; }
        public double getMultiplier() { return multiplier; }
        public void setMultiplier(double multiplier) { this.multiplier = multiplier; }
    }

    public static class KafkaTestRequestDto {
        private String scenario; // SUCCESS, TEMPORARY, PERMANENT, DUPLICATE, ALL
        private String payload;

        public String getScenario() { return scenario; }
        public void setScenario(String scenario) { this.scenario = scenario; }
        public String getPayload() { return payload; }
        public void setPayload(String payload) { this.payload = payload; }
    }

    public static class KafkaTestItemResult {
        private String scenario;
        private String status; // PASS, FAIL
        private int attempts;
        private String eventId;
        private String details;

        public KafkaTestItemResult() {}

        public KafkaTestItemResult(String scenario, String status, int attempts, String eventId, String details) {
            this.scenario = scenario;
            this.status = status;
            this.attempts = attempts;
            this.eventId = eventId;
            this.details = details;
        }

        public String getScenario() { return scenario; }
        public void setScenario(String scenario) { this.scenario = scenario; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
    }

    public static class KafkaTestReportDto {
        private LocalDateTime timestamp;
        private int totalTests;
        private int passedTests;
        private int failedTests;
        private java.util.List<KafkaTestItemResult> results = new java.util.ArrayList<>();

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public int getTotalTests() { return totalTests; }
        public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
        public int getPassedTests() { return passedTests; }
        public void setPassedTests(int passedTests) { this.passedTests = passedTests; }
        public int getFailedTests() { return failedTests; }
        public void setFailedTests(int failedTests) { this.failedTests = failedTests; }
        public java.util.List<KafkaTestItemResult> getResults() { return results; }
        public void setResults(java.util.List<KafkaTestItemResult> results) { this.results = results; }
    }
}
