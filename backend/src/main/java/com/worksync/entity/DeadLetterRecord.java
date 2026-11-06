package com.worksync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dead_letter_records", indexes = {
    @Index(name = "idx_dlq_event_id", columnList = "event_id")
})
public class DeadLetterRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, length = 64)
    private String eventId;

    @Column(name = "original_topic", nullable = false, length = 100)
    private String originalTopic;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column(name = "routed_at", nullable = false)
    private LocalDateTime routedAt = LocalDateTime.now();

    @Column(name = "reprocessed_at")
    private LocalDateTime reprocessedAt;

    @Column(nullable = false)
    private boolean reprocessed = false;

    public DeadLetterRecord() {}

    public DeadLetterRecord(String eventId, String originalTopic, String errorMessage, String stackTrace) {
        this.eventId = eventId;
        this.originalTopic = originalTopic;
        this.errorMessage = errorMessage;
        this.stackTrace = stackTrace;
        this.routedAt = LocalDateTime.now();
        this.reprocessed = false;
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

    public String getOriginalTopic() {
        return originalTopic;
    }

    public void setOriginalTopic(String originalTopic) {
        this.originalTopic = originalTopic;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    public LocalDateTime getRoutedAt() {
        return routedAt;
    }

    public void setRoutedAt(LocalDateTime routedAt) {
        this.routedAt = routedAt;
    }

    public LocalDateTime getReprocessedAt() {
        return reprocessedAt;
    }

    public void setReprocessedAt(LocalDateTime reprocessedAt) {
        this.reprocessedAt = reprocessedAt;
    }

    public boolean isReprocessed() {
        return reprocessed;
    }

    public void setReprocessed(boolean reprocessed) {
        this.reprocessed = reprocessed;
    }
}
