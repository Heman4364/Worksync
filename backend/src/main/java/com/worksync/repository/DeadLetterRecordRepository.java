package com.worksync.repository;

import com.worksync.entity.DeadLetterRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeadLetterRecordRepository extends JpaRepository<DeadLetterRecord, Long> {
    Page<DeadLetterRecord> findAllByOrderByRoutedAtDesc(Pageable pageable);
    Optional<DeadLetterRecord> findByEventId(String eventId);
    long countByReprocessedFalse();
}
