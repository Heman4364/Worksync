package com.worksync.repository;

import com.worksync.entity.ProcessingLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessingLogRepository extends JpaRepository<ProcessingLog, Long> {
    List<ProcessingLog> findByEventIdOrderByTimestampAsc(String eventId);
    Page<ProcessingLog> findAllByOrderByTimestampDesc(Pageable pageable);
    void deleteAll();
}
