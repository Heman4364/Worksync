package com.worksync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kafka_event_records", indexes = {
    @Index(name = "idx_kafka_event_id", columnList = "event_id", unique = true),
    @Index(name = "idx_kafka_status", columnList = "status"),
    @Index(name = "idx_kafka_created_at", columnList = "created_at")
})
public class KafkaEventRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true, length = 64)
    private String eventId;

    @Column(nullable = false, length = 100)
    private String topic;

    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT")
    private String payloadJson;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, PROCESSING, RETRYING, COMPLETED, DLQ, DUPLICATE_IGNORED

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "simulation_mode", length = 30)
    private String simulationMode = "NONE"; // NONE, TEMPORARY, PERMANENT, DUPLICATE

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public KafkaEventRecord() {}

    public KafkaEventRecord(String eventId, String topic, String payloadJson, String simulationMode) {
        this.eventId = eventId;
        this.topic = topic;
        this.payloadJson = payloadJson;
        this.simulationMode = simulationMode;
        this.status = "PENDING";
        this.attemptCount = 0;
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

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getSimulationMode() {
        return simulationMode;
    }

    public void setSimulationMode(String simulationMode) {
        this.simulationMode = simulationMode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
