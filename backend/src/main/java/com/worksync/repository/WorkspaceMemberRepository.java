package com.worksync.repository;

import com.worksync.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    @Query("SELECT wm FROM WorkspaceMember wm JOIN FETCH wm.user WHERE wm.workspace.id = :workspaceId")
    List<WorkspaceMember> findByWorkspaceIdWithUser(@Param("workspaceId") Long workspaceId);

    @Query("SELECT wm FROM WorkspaceMember wm JOIN FETCH wm.workspace WHERE wm.user.id = :userId")
    List<WorkspaceMember> findByUserIdWithWorkspace(@Param("userId") Long userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}
