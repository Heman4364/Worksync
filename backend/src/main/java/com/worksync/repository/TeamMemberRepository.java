package com.worksync.repository;

import com.worksync.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.user WHERE tm.team.id = :teamId")
    List<TeamMember> findByTeamIdWithUser(@Param("teamId") Long teamId);

    List<TeamMember> findByUserId(Long userId);

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
}
