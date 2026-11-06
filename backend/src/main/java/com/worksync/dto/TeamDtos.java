package com.worksync.dto;

import com.worksync.entity.Team;
import com.worksync.entity.TeamMember;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class TeamDtos {

    public static class TeamDto {
        private Long id;
        private Long workspaceId;
        private String name;
        private String description;
        private int memberCount;
        private LocalDateTime createdAt;

        public static TeamDto fromEntity(Team team, int memberCount) {
            if (team == null) return null;
            TeamDto dto = new TeamDto();
            dto.setId(team.getId());
            dto.setWorkspaceId(team.getWorkspace().getId());
            dto.setName(team.getName());
            dto.setDescription(team.getDescription());
            dto.setMemberCount(memberCount);
            dto.setCreatedAt(team.getCreatedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public int getMemberCount() { return memberCount; }
        public void setMemberCount(int memberCount) { this.memberCount = memberCount; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class TeamCreateRequest {
        @NotBlank(message = "Team name is required")
        private String name;
        private String description;
        private Long workspaceId;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
    }

    public static class TeamMemberDto {
        private Long id;
        private Long teamId;
        private Long userId;
        private String userName;
        private String userEmail;
        private String userAvatar;
        private String roleInTeam;
        private LocalDateTime joinedAt;

        public static TeamMemberDto fromEntity(TeamMember tm) {
            if (tm == null) return null;
            TeamMemberDto dto = new TeamMemberDto();
            dto.setId(tm.getId());
            dto.setTeamId(tm.getTeam().getId());
            dto.setUserId(tm.getUser().getId());
            dto.setUserName(tm.getUser().getFirstName() + " " + tm.getUser().getLastName());
            dto.setUserEmail(tm.getUser().getEmail());
            dto.setUserAvatar(tm.getUser().getAvatarUrl());
            dto.setRoleInTeam(tm.getRoleInTeam());
            dto.setJoinedAt(tm.getJoinedAt());
            return dto;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTeamId() { return teamId; }
        public void setTeamId(Long teamId) { this.teamId = teamId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getUserAvatar() { return userAvatar; }
        public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
        public String getRoleInTeam() { return roleInTeam; }
        public void setRoleInTeam(String roleInTeam) { this.roleInTeam = roleInTeam; }
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class TeamMemberAddRequest {
        private Long userId;
        private String roleInTeam = "Member";

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getRoleInTeam() { return roleInTeam; }
        public void setRoleInTeam(String roleInTeam) { this.roleInTeam = roleInTeam; }
    }
}
