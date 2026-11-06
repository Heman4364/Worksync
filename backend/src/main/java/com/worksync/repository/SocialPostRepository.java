package com.worksync.repository;

import com.worksync.entity.PostStatus;
import com.worksync.entity.SocialPlatform;
import com.worksync.entity.SocialPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SocialPostRepository extends JpaRepository<SocialPost, Long> {

    @Query(value = "SELECT sp FROM SocialPost sp " +
                   "JOIN FETCH sp.workspace w " +
                   "JOIN FETCH sp.author a " +
                   "WHERE sp.workspace.id = :workspaceId",
           countQuery = "SELECT COUNT(sp) FROM SocialPost sp WHERE sp.workspace.id = :workspaceId")
    Page<SocialPost> findByWorkspaceIdWithAuthor(@Param("workspaceId") Long workspaceId, Pageable pageable);

    List<SocialPost> findByStatusAndScheduledAtLessThanEqual(PostStatus status, LocalDateTime now);

    long countByWorkspaceId(Long workspaceId);
    long countByWorkspaceIdAndStatus(Long workspaceId, PostStatus status);
    long countByWorkspaceIdAndPlatform(Long workspaceId, SocialPlatform platform);
}
