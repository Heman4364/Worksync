package com.worksync.repository;

import com.worksync.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    @Query(value = "SELECT al FROM ActivityLog al LEFT JOIN FETCH al.user WHERE al.workspace.id = :workspaceId ORDER BY al.timestamp DESC",
           countQuery = "SELECT COUNT(al) FROM ActivityLog al WHERE al.workspace.id = :workspaceId")
    Page<ActivityLog> findByWorkspaceIdWithUser(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query("SELECT al FROM ActivityLog al LEFT JOIN FETCH al.user WHERE al.workspace.id = :workspaceId ORDER BY al.timestamp DESC")
    List<ActivityLog> findTop15ByWorkspaceIdWithUser(@Param("workspaceId") Long workspaceId);
}
