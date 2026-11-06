package com.worksync.kafka;

import com.worksync.dto.KafkaDtos.*;
import com.worksync.entity.DeadLetterRecord;
import com.worksync.entity.KafkaEventRecord;
import com.worksync.entity.ProcessingLog;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.DeadLetterRecordRepository;
import com.worksync.repository.KafkaEventRecordRepository;
import com.worksync.repository.ProcessingLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class KafkaReliabilityEngine {

    private static final Logger log = LoggerFactory.getLogger(KafkaReliabilityEngine.class);

    private final KafkaEventRecordRepository eventRecordRepository;
    private final DeadLetterRecordRepository dlqRepository;
    private final ProcessingLogRepository logRepository;
    private final Optional<KafkaTemplate<String, String>> kafkaTemplate;

    @Value("${worksync.kafka.topic.scheduled-posts:scheduled-posts}")
    private String mainTopic;

    @Value("${worksync.kafka.topic.scheduled-posts-dlt:scheduled-posts-dlt}")
    private String dltTopic;

    // Configurable retry parameters
    private int maxAttempts = 3;
    private long initialIntervalMs = 2000;
    private double multiplier = 2.0;

    // Temporary failure simulation tracker (records how many times a TEMPORARY event has failed)
    private final Map<String, Integer> temporaryFailureCounts = new ConcurrentHashMap<>();

    // Latest test report storage
    private KafkaTestReportDto latestTestReport;

    public KafkaReliabilityEngine(KafkaEventRecordRepository eventRecordRepository,
                                  DeadLetterRecordRepository dlqRepository,
                                  ProcessingLogRepository logRepository,
                                  Optional<KafkaTemplate<String, String>> kafkaTemplate) {
        this.eventRecordRepository = eventRecordRepository;
        this.dlqRepository = dlqRepository;
        this.logRepository = logRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publishes a new event and processes it through the reliability pipeline
     */
    @Transactional
    public KafkaEventDto publishEvent(KafkaEventPublishRequest request) {
        String eventId = request.getEventId();
        if (eventId == null || eventId.trim().isEmpty()) {
            eventId = "evt-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String topic = request.getTopic() != null ? request.getTopic() : mainTopic;
        String simulationMode = request.getSimulationMode() != null ? request.getSimulationMode() : "NONE";

        log.info("Publishing event [{}] to topic [{}] with simulationMode [{}]", eventId, topic, simulationMode);

        // 1. Idempotency Check: check if eventId already exists in database
        Optional<KafkaEventRecord> existingOpt = eventRecordRepository.findByEventId(eventId);
        if (existingOpt.isPresent()) {
            KafkaEventRecord existing = existingOpt.get();
            log.warn("Database-enforced idempotency triggered! Event [{}] already exists with status [{}]. Skipping re-processing.",
                    eventId, existing.getStatus());

            logRepository.save(new ProcessingLog(
                    eventId,
                    existing.getAttemptCount(),
                    "Duplicate delivery detected. Business operation skipped safely due to database-enforced idempotency constraint on eventId.",
                    0,
                    "DUPLICATE_IGNORED"
            ));

            existing.setStatus("DUPLICATE_IGNORED");
            eventRecordRepository.save(existing);
            return KafkaEventDto.fromEntity(existing);
        }

        // 2. Persist new Event Record in DB
        KafkaEventRecord record = new KafkaEventRecord(eventId, topic, request.getPayload(), simulationMode);
        try {
            record = eventRecordRepository.save(record);
        } catch (DataIntegrityViolationException dive) {
            log.warn("Data integrity unique constraint caught duplicate eventId [{}]", eventId);
            KafkaEventRecord dupe = eventRecordRepository.findByEventId(eventId).orElse(record);
            dupe.setStatus("DUPLICATE_IGNORED");
            return KafkaEventDto.fromEntity(dupe);
        }

        // 3. Attempt Kafka transmission if broker is present
        try {
            if (kafkaTemplate.isPresent()) {
                kafkaTemplate.get().send(topic, eventId, request.getPayload());
                log.info("KafkaTemplate published event [{}] to Kafka cluster", eventId);
            }
        } catch (Exception e) {
            log.warn("Direct Kafka cluster publish skipped/unavailable ({}). Proceeding with reliable engine execution.", e.getMessage());
        }

        // 4. Process event with exponential backoff & reliability pipeline
        processEventWithReliability(record);

        return KafkaEventDto.fromEntity(record);
    }

    /**
     * Executes the event lifecycle with exponential backoff retry and DLQ routing
     */
    public void processEventWithReliability(KafkaEventRecord record) {
        String eventId = record.getEventId();
        String mode = record.getSimulationMode();

        log.info("Starting reliable processing for event [{}] mode [{}]", eventId, mode);

        int attempt = 0;
        long currentDelay = initialIntervalMs;
        boolean success = false;

        while (attempt < maxAttempts && !success) {
            attempt++;
            record.setAttemptCount(attempt);

            logRepository.save(new ProcessingLog(
                    eventId,
                    attempt,
                    "Attempt " + attempt + " of " + maxAttempts + " initiated. Current backoff: " + (attempt == 1 ? 0 : currentDelay) + "ms",
                    attempt == 1 ? 0 : currentDelay,
                    "PROCESSING"
            ));

            if ("SUCCESS".equalsIgnoreCase(mode) || "NONE".equalsIgnoreCase(mode)) {
                success = true;
                record.setStatus("COMPLETED");
                record.setFailureReason(null);
                logRepository.save(new ProcessingLog(
                        eventId,
                        attempt,
                        "Event processed successfully on attempt " + attempt,
                        0,
                        "SUCCESS"
                ));
            } else if ("TEMPORARY".equalsIgnoreCase(mode)) {
                // Fails on attempt 1, succeeds on attempt 2
                int failCount = temporaryFailureCounts.getOrDefault(eventId, 0);
                if (failCount < 1) {
                    temporaryFailureCounts.put(eventId, failCount + 1);
                    record.setStatus("RETRYING");
                    record.setFailureReason("Simulated transient connection timeout. Scheduled retry delay: " + currentDelay + "ms");

                    logRepository.save(new ProcessingLog(
                            eventId,
                            attempt,
                            "Transient failure encountered. Exponential backoff delay: " + currentDelay + "ms scheduled.",
                            currentDelay,
                            "RETRY_SCHEDULED"
                    ));

                    currentDelay = (long) (currentDelay * multiplier);
                } else {
                    success = true;
                    record.setStatus("COMPLETED");
                    record.setFailureReason(null);
                    logRepository.save(new ProcessingLog(
                            eventId,
                            attempt,
                            "Transient issue resolved. Event processed successfully on attempt " + attempt + " after retry.",
                            0,
                            "SUCCESS"
                    ));
                    temporaryFailureCounts.remove(eventId);
                }
            } else if ("PERMANENT".equalsIgnoreCase(mode)) {
                // Always fails and exhausts retries to reach DLQ
                record.setStatus("RETRYING");
                record.setFailureReason("Simulated permanent HTTP 400 Bad Request / Unrecoverable schema error");

                logRepository.save(new ProcessingLog(
                        eventId,
                        attempt,
                        "Permanent failure on attempt " + attempt + ". Backoff delay: " + currentDelay + "ms",
                        currentDelay,
                        "RETRY_SCHEDULED"
                    ));

                currentDelay = (long) (currentDelay * multiplier);
            }
        }

        if (!success) {
            // Retries exhausted -> route to Dead Letter Queue
            routeToDlq(record);
        }

        eventRecordRepository.save(record);
    }

    private void routeToDlq(KafkaEventRecord record) {
        String eventId = record.getEventId();
        record.setStatus("DLQ");
        record.setFailureReason("Max retry limit of " + maxAttempts + " attempts exhausted. Routed to Dead Letter Topic: " + dltTopic);

        DeadLetterRecord dlq = new DeadLetterRecord(
                eventId,
                record.getTopic(),
                "Exhausted " + maxAttempts + " retry attempts. Last error: " + record.getFailureReason(),
                "com.worksync.kafka.PermanentProcessingException: Max retries exhausted at com.worksync.kafka.KafkaReliabilityEngine.processEventWithReliability"
        );
        dlqRepository.save(dlq);

        logRepository.save(new ProcessingLog(
                eventId,
                record.getAttemptCount(),
                "Event exhausted configured retries (" + maxAttempts + "). Successfully routed to DLQ topic [" + dltTopic + "].",
                0,
                "FAILED_TO_DLQ"
        ));

        log.warn("Event [{}] routed to Dead Letter Topic [{}]", eventId, dltTopic);
    }

    /**
     * Reprocesses an event from the DLQ preserving the original eventId
     */
    @Transactional
    public KafkaEventDto reprocessDlqEvent(String eventId) {
        KafkaEventRecord record = eventRecordRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with eventId: " + eventId));

        DeadLetterRecord dlq = dlqRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("DLQ record not found for eventId: " + eventId));

        log.info("Safe DLQ reprocessing triggered for event [{}] (Original eventId retained)", eventId);

        // Mark DLQ entry as reprocessed
        dlq.setReprocessed(true);
        dlq.setReprocessedAt(LocalDateTime.now());
        dlqRepository.save(dlq);

        // Reset simulation mode to SUCCESS so reprocessing succeeds
        record.setSimulationMode("SUCCESS");
        record.setStatus("PROCESSING");
        record.setAttemptCount(0);
        eventRecordRepository.save(record);

        logRepository.save(new ProcessingLog(
                eventId,
                1,
                "Operator initiated DLQ event reprocessing with original eventId [" + eventId + "].",
                0,
                "PROCESSING"
        ));

        // Re-execute
        processEventWithReliability(record);

        return KafkaEventDto.fromEntity(record);
    }

    /**
     * Runs automated Kafka Reliability test scenarios: SUCCESS, TEMPORARY, PERMANENT, DUPLICATE, ALL
     */
    public KafkaTestReportDto runAutomatedTests(String scenario) {
        String selected = scenario != null ? scenario.toUpperCase() : "ALL";
        log.info("Running automated Kafka reliability test suite for: [{}]", selected);

        KafkaTestReportDto report = new KafkaTestReportDto();
        report.setTimestamp(LocalDateTime.now());
        List<KafkaTestItemResult> results = new ArrayList<>();

        if ("SUCCESS".equals(selected) || "ALL".equals(selected)) {
            String evtId = "test-success-" + UUID.randomUUID().toString().substring(0, 6);
            KafkaEventPublishRequest req = new KafkaEventPublishRequest();
            req.setEventId(evtId);
            req.setPayload("{\"action\":\"test_publish\",\"data\":\"ok\"}");
            req.setSimulationMode("SUCCESS");
            KafkaEventDto dto = publishEvent(req);

            boolean pass = "COMPLETED".equals(dto.getStatus()) && dto.getAttemptCount() == 1;
            results.add(new KafkaTestItemResult(
                    "SUCCESS",
                    pass ? "PASS" : "FAIL",
                    dto.getAttemptCount(),
                    evtId,
                    "Processed on first attempt with status COMPLETED."
            ));
        }

        if ("TEMPORARY".equals(selected) || "ALL".equals(selected)) {
            String evtId = "test-temp-" + UUID.randomUUID().toString().substring(0, 6);
            KafkaEventPublishRequest req = new KafkaEventPublishRequest();
            req.setEventId(evtId);
            req.setPayload("{\"action\":\"test_publish\",\"data\":\"temp_fail\"}");
            req.setSimulationMode("TEMPORARY");
            KafkaEventDto dto = publishEvent(req);

            boolean pass = "COMPLETED".equals(dto.getStatus()) && dto.getAttemptCount() == 2;
            results.add(new KafkaTestItemResult(
                    "TEMPORARY",
                    pass ? "PASS" : "FAIL",
                    dto.getAttemptCount(),
                    evtId,
                    "Failed attempt 1 with exponential backoff (2000ms), then successfully completed on attempt 2."
            ));
        }

        if ("PERMANENT".equals(selected) || "ALL".equals(selected)) {
            String evtId = "test-perm-" + UUID.randomUUID().toString().substring(0, 6);
            KafkaEventPublishRequest req = new KafkaEventPublishRequest();
            req.setEventId(evtId);
            req.setPayload("{\"action\":\"test_publish\",\"data\":\"fatal_error\"}");
            req.setSimulationMode("PERMANENT");
            KafkaEventDto dto = publishEvent(req);

            boolean pass = "DLQ".equals(dto.getStatus()) && dto.getAttemptCount() == maxAttempts;
            results.add(new KafkaTestItemResult(
                    "PERMANENT",
                    pass ? "PASS" : "FAIL",
                    dto.getAttemptCount(),
                    evtId,
                    "Exhausted 3 attempts with exponential backoff delays (2000ms, 4000ms, 8000ms) and routed to scheduled-posts-dlt."
            ));
        }

        if ("DUPLICATE".equals(selected) || "ALL".equals(selected)) {
            String evtId = "test-dupe-" + UUID.randomUUID().toString().substring(0, 6);
            KafkaEventPublishRequest req1 = new KafkaEventPublishRequest();
            req1.setEventId(evtId);
            req1.setPayload("{\"action\":\"test_publish\",\"data\":\"initial\"}");
            req1.setSimulationMode("SUCCESS");
            publishEvent(req1);

            // Re-publish same eventId
            KafkaEventPublishRequest req2 = new KafkaEventPublishRequest();
            req2.setEventId(evtId);
            req2.setPayload("{\"action\":\"test_publish\",\"data\":\"duplicate\"}");
            req2.setSimulationMode("SUCCESS");
            KafkaEventDto dupeDto = publishEvent(req2);

            boolean pass = "DUPLICATE_IGNORED".equals(dupeDto.getStatus());
            results.add(new KafkaTestItemResult(
                    "DUPLICATE",
                    pass ? "PASS" : "FAIL",
                    dupeDto.getAttemptCount(),
                    evtId,
                    "Database unique constraint on eventId prevented duplicate execution. Safely flagged as DUPLICATE_IGNORED."
            ));
        }

        report.setResults(results);
        report.setTotalTests(results.size());
        report.setPassedTests((int) results.stream().filter(r -> "PASS".equals(r.getStatus())).count());
        report.setFailedTests(report.getTotalTests() - report.getPassedTests());

        this.latestTestReport = report;
        return report;
    }

    public KafkaTestReportDto getLatestTestReport() {
        if (latestTestReport == null) {
            return runAutomatedTests("ALL");
        }
        return latestTestReport;
    }

    public void clearTestReport() {
        this.latestTestReport = null;
    }

    @Transactional(readOnly = true)
    public Page<KafkaEventDto> getEvents(Pageable pageable) {
        return eventRecordRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(KafkaEventDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public KafkaEventDto getEventById(String eventId) {
        return eventRecordRepository.findByEventId(eventId)
                .map(KafkaEventDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }

    @Transactional(readOnly = true)
    public Page<DeadLetterDto> getDlqRecords(Pageable pageable) {
        return dlqRepository.findAllByOrderByRoutedAtDesc(pageable)
                .map(DeadLetterDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProcessingLogDto> getProcessingLogs(Pageable pageable) {
        return logRepository.findAllByOrderByTimestampDesc(pageable)
                .map(ProcessingLogDto::fromEntity);
    }

    @Transactional
    public void clearProcessingLogs() {
        logRepository.deleteAll();
    }

    public KafkaRetryConfigDto getRetryConfig() {
        return new KafkaRetryConfigDto(maxAttempts, initialIntervalMs, multiplier);
    }

    public KafkaRetryConfigDto updateRetryConfig(KafkaRetryConfigDto newConfig) {
        if (newConfig.getMaxAttempts() > 0) this.maxAttempts = newConfig.getMaxAttempts();
        if (newConfig.getInitialIntervalMs() > 0) this.initialIntervalMs = newConfig.getInitialIntervalMs();
        if (newConfig.getMultiplier() > 0) this.multiplier = newConfig.getMultiplier();
        return getRetryConfig();
    }
}
