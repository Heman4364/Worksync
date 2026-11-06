package com.worksync.repository;

import com.worksync.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    @Query("SELECT ce FROM CalendarEvent ce LEFT JOIN FETCH ce.user WHERE ce.workspace.id = :workspaceId AND ce.startTime BETWEEN :start AND :end ORDER BY ce.startTime ASC")
    List<CalendarEvent> findByWorkspaceIdAndStartTimeBetween(@Param("workspaceId") Long workspaceId,
                                                             @Param("start") LocalDateTime start,
                                                             @Param("end") LocalDateTime end);

    @Query("SELECT ce FROM CalendarEvent ce LEFT JOIN FETCH ce.user WHERE ce.workspace.id = :workspaceId ORDER BY ce.startTime ASC")
    List<CalendarEvent> findByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
