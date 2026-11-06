package com.worksync.service;

import com.worksync.dto.TeamDtos.*;
import com.worksync.entity.Team;
import com.worksync.entity.TeamMember;
import com.worksync.entity.User;
import com.worksync.entity.Workspace;
import com.worksync.exception.BadRequestException;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.TeamMemberRepository;
import com.worksync.repository.TeamRepository;
import com.worksync.repository.UserRepository;
import com.worksync.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       WorkspaceRepository workspaceRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getWorkspaceTeams(Long workspaceId) {
        return teamRepository.findByWorkspaceId(workspaceId).stream()
                .map(team -> {
                    int count = teamMemberRepository.findByTeamIdWithUser(team.getId()).size();
                    return TeamDto.fromEntity(team, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamDto createTeam(TeamCreateRequest request) {
        Workspace ws = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + request.getWorkspaceId()));

        Team team = new Team(ws, request.getName(), request.getDescription());
        team = teamRepository.save(team);
        return TeamDto.fromEntity(team, 0);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberDto> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamIdWithUser(teamId).stream()
                .map(TeamMemberDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamMemberDto addTeamMember(Long teamId, TeamMemberAddRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        if (teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId()).isPresent()) {
            throw new BadRequestException("User is already a member of this team");
        }

        TeamMember tm = new TeamMember(team, user, request.getRoleInTeam());
        tm = teamMemberRepository.save(tm);
        return TeamMemberDto.fromEntity(tm);
    }

    @Transactional
    public void removeTeamMember(Long teamId, Long userId) {
        TeamMember tm = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in team"));
        teamMemberRepository.delete(tm);
    }
}
