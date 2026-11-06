package com.worksync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processing_logs", indexes = {
    @Index(name = "idx_log_event_id", columnList = "event_id"),
    @Index(name = "idx_log_timestamp", columnList = "timestamp")
})
public class ProcessingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, length = 64)
    private String eventId;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "delay_ms", nullable = false)
    private long delayMs;

    @Column(nullable = false, length = 30)
    private String status; // PROCESSING, RETRY_SCHEDULED, SUCCESS, FAILED_TO_DLQ, DUPLICATE_IGNORED

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ProcessingLog() {}

    public ProcessingLog(String eventId, int attemptNumber, String message, long delayMs, String status) {
        this.eventId = eventId;
        this.attemptNumber = attemptNumber;
        this.message = message;
        this.delayMs = delayMs;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getDelayMs() {
        return delayMs;
    }

    public void setDelayMs(long delayMs) {
        this.delayMs = delayMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
