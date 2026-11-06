package com.worksync.repository;

import com.worksync.entity.Project;
import com.worksync.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query(value = "SELECT p FROM Project p " +
                   "JOIN FETCH p.workspace w " +
                   "LEFT JOIN FETCH p.manager m " +
                   "LEFT JOIN FETCH p.team t " +
                   "WHERE p.workspace.id = :workspaceId",
           countQuery = "SELECT COUNT(p) FROM Project p WHERE p.workspace.id = :workspaceId")
    Page<Project> findByWorkspaceIdWithDetails(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query("SELECT p FROM Project p " +
           "JOIN FETCH p.workspace w " +
           "LEFT JOIN FETCH p.manager m " +
           "LEFT JOIN FETCH p.team t " +
           "WHERE p.id = :id")
    Optional<Project> findByIdWithDetails(@Param("id") Long id);

    long countByWorkspaceId(Long workspaceId);
    long countByWorkspaceIdAndStatus(Long workspaceId, ProjectStatus status);
}
