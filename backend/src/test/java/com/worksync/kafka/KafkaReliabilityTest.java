package com.worksync.kafka;

import com.worksync.dto.KafkaDtos.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class KafkaReliabilityTest {

    @Autowired
    private KafkaReliabilityEngine kafkaEngine;

    @Test
    void testSuccessfulEventProcessing() {
        String eventId = "unit-succ-" + UUID.randomUUID().toString().substring(0, 6);
        KafkaEventPublishRequest req = new KafkaEventPublishRequest();
        req.setEventId(eventId);
        req.setPayload("{\"test\":\"success\"}");
        req.setSimulationMode("SUCCESS");

        KafkaEventDto dto = kafkaEngine.publishEvent(req);

        assertNotNull(dto);
        assertEquals("COMPLETED", dto.getStatus());
        assertEquals(1, dto.getAttemptCount());
    }

    @Test
    void testTemporaryFailureAndSuccessfulRetry() {
        String eventId = "unit-temp-" + UUID.randomUUID().toString().substring(0, 6);
        KafkaEventPublishRequest req = new KafkaEventPublishRequest();
        req.setEventId(eventId);
        req.setPayload("{\"test\":\"temp\"}");
        req.setSimulationMode("TEMPORARY");

        KafkaEventDto dto = kafkaEngine.publishEvent(req);

        assertNotNull(dto);
        assertEquals("COMPLETED", dto.getStatus());
        assertEquals(2, dto.getAttemptCount());
    }

    @Test
    void testPermanentFailureAndDlqRouting() {
        String eventId = "unit-perm-" + UUID.randomUUID().toString().substring(0, 6);
        KafkaEventPublishRequest req = new KafkaEventPublishRequest();
        req.setEventId(eventId);
        req.setPayload("{\"test\":\"perm\"}");
        req.setSimulationMode("PERMANENT");

        KafkaEventDto dto = kafkaEngine.publishEvent(req);

        assertNotNull(dto);
        assertEquals("DLQ", dto.getStatus());
        assertEquals(3, dto.getAttemptCount());

        // Test safe reprocessing retaining original eventId
        KafkaEventDto reprocessed = kafkaEngine.reprocessDlqEvent(eventId);
        assertNotNull(reprocessed);
        assertEquals(eventId, reprocessed.getEventId());
        assertEquals("COMPLETED", reprocessed.getStatus());
    }

    @Test
    void testDatabaseEnforcedIdempotency() {
        String eventId = "unit-dupe-" + UUID.randomUUID().toString().substring(0, 6);
        KafkaEventPublishRequest req1 = new KafkaEventPublishRequest();
        req1.setEventId(eventId);
        req1.setPayload("{\"test\":\"initial\"}");
        req1.setSimulationMode("SUCCESS");
        kafkaEngine.publishEvent(req1);

        // Attempt second delivery with identical eventId
        KafkaEventPublishRequest req2 = new KafkaEventPublishRequest();
        req2.setEventId(eventId);
        req2.setPayload("{\"test\":\"duplicate\"}");
        req2.setSimulationMode("SUCCESS");
        KafkaEventDto dupeDto = kafkaEngine.publishEvent(req2);

        assertEquals("DUPLICATE_IGNORED", dupeDto.getStatus());
    }
}
