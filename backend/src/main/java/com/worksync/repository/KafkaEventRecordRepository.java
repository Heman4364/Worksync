package com.worksync.repository;

import com.worksync.entity.KafkaEventRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KafkaEventRecordRepository extends JpaRepository<KafkaEventRecord, Long> {
    Optional<KafkaEventRecord> findByEventId(String eventId);
    boolean existsByEventId(String eventId);
    Page<KafkaEventRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
