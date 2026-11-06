package com.worksync.repository;

import com.worksync.entity.Draft;
import com.worksync.entity.SocialPlatform;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {

    @Query(value = "SELECT d FROM Draft d JOIN FETCH d.user u WHERE d.workspace.id = :workspaceId",
           countQuery = "SELECT COUNT(d) FROM Draft d WHERE d.workspace.id = :workspaceId")
    Page<Draft> findByWorkspaceId(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query(value = "SELECT d FROM Draft d JOIN FETCH d.user u WHERE d.workspace.id = :workspaceId AND d.platform = :platform",
           countQuery = "SELECT COUNT(d) FROM Draft d WHERE d.workspace.id = :workspaceId AND d.platform = :platform")
    Page<Draft> findByWorkspaceIdAndPlatform(@Param("workspaceId") Long workspaceId, @Param("platform") SocialPlatform platform, Pageable pageable);

    @Query(value = "SELECT d FROM Draft d JOIN FETCH d.user u WHERE d.workspace.id = :workspaceId AND " +
                   "(LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.content) LIKE LOWER(CONCAT('%', :query, '%')))",
           countQuery = "SELECT COUNT(d) FROM Draft d WHERE d.workspace.id = :workspaceId AND " +
                        "(LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Draft> searchDrafts(@Param("workspaceId") Long workspaceId, @Param("query") String query, Pageable pageable);

    long countByWorkspaceId(Long workspaceId);
}
