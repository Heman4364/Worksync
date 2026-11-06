package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.TeamDtos.*;
import com.worksync.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamDto>>> getWorkspaceTeams(@RequestParam Long workspaceId) {
        List<TeamDto> teams = teamService.getWorkspaceTeams(workspaceId);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamDto>> createTeam(@Valid @RequestBody TeamCreateRequest request) {
        TeamDto team = teamService.createTeam(request);
        return ResponseEntity.ok(ApiResponse.success(team, "Team created successfully"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<TeamMemberDto>>> getTeamMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeamMembers(id)));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamMemberDto>> addTeamMember(@PathVariable Long id,
                                                                    @RequestBody TeamMemberAddRequest request) {
        TeamMemberDto member = teamService.addTeamMember(id, request);
        return ResponseEntity.ok(ApiResponse.success(member, "Team member added successfully"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeTeamMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeTeamMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Team member removed"));
    }
}
