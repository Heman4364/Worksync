package com.worksync.repository;

import com.worksync.entity.Task;
import com.worksync.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query(value = "SELECT t FROM Task t " +
                   "JOIN FETCH t.project p " +
                   "LEFT JOIN FETCH t.assignedTo u " +
                   "JOIN FETCH t.createdBy c " +
                   "WHERE p.workspace.id = :workspaceId",
           countQuery = "SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId")
    Page<Task> findAllByWorkspaceIdWithDetails(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query(value = "SELECT t FROM Task t " +
                   "JOIN FETCH t.project p " +
                   "LEFT JOIN FETCH t.assignedTo u " +
                   "JOIN FETCH t.createdBy c " +
                   "WHERE t.project.id = :projectId",
           countQuery = "SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Page<Task> findByProjectIdWithDetails(@Param("projectId") Long projectId, Pageable pageable);

    @Query(value = "SELECT t FROM Task t " +
                   "JOIN FETCH t.project p " +
                   "LEFT JOIN FETCH t.assignedTo u " +
                   "JOIN FETCH t.createdBy c " +
                   "WHERE t.assignedTo.id = :userId",
           countQuery = "SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId")
    Page<Task> findByAssignedToIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Task t " +
           "JOIN FETCH t.project p " +
           "LEFT JOIN FETCH t.assignedTo u " +
           "JOIN FETCH t.createdBy c " +
           "WHERE t.id = :id")
    Optional<Task> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT t FROM Task t " +
           "JOIN FETCH t.project p " +
           "LEFT JOIN FETCH t.assignedTo u " +
           "WHERE p.workspace.id = :workspaceId")
    List<Task> findAllByWorkspaceIdForKanban(@Param("workspaceId") Long workspaceId);

    long countByProjectWorkspaceId(Long workspaceId);
    long countByProjectWorkspaceIdAndStatus(Long workspaceId, TaskStatus status);
    long countByProjectWorkspaceIdAndDueDateBeforeAndStatusNot(Long workspaceId, LocalDate date, TaskStatus status);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    long countByProjectId(Long projectId);
}
