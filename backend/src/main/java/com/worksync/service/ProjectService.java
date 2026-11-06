package com.worksync.service;

import com.worksync.dto.ProjectDtos.*;
import com.worksync.entity.*;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    public ProjectService(ProjectRepository projectRepository,
                          WorkspaceRepository workspaceRepository,
                          TeamRepository teamRepository,
                          UserRepository userRepository,
                          TaskRepository taskRepository,
                          ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> getWorkspaceProjects(Long workspaceId, Pageable pageable) {
        return projectRepository.findByWorkspaceIdWithDetails(workspaceId, pageable)
                .map(p -> {
                    ProjectDto dto = ProjectDto.fromEntity(p);
                    dto.setTotalTasks(taskRepository.countByProjectId(p.getId()));
                    dto.setCompletedTasks(taskRepository.countByProjectIdAndStatus(p.getId(), TaskStatus.COMPLETED));
                    return dto;
                });
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        Project p = projectRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        ProjectDto dto = ProjectDto.fromEntity(p);
        dto.setTotalTasks(taskRepository.countByProjectId(p.getId()));
        dto.setCompletedTasks(taskRepository.countByProjectIdAndStatus(p.getId(), TaskStatus.COMPLETED));
        return dto;
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "projectSummaries"}, allEntries = true)
    public ProjectDto createProject(ProjectCreateRequest req, User currentUser) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        Team team = null;
        if (req.getTeamId() != null) {
            team = teamRepository.findById(req.getTeamId()).orElse(null);
        }

        User manager = currentUser;
        if (req.getManagerId() != null) {
            manager = userRepository.findById(req.getManagerId()).orElse(currentUser);
        }

        Project project = new Project();
        project.setWorkspace(ws);
        project.setTeam(team);
        project.setManager(manager);
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setStatus(req.getStatus() != null ? req.getStatus() : ProjectStatus.PLANNING);
        project.setPriority(req.getPriority() != null ? req.getPriority() : ProjectPriority.MEDIUM);
        project.setStartDate(req.getStartDate());
        project.setDueDate(req.getDueDate());
        project.setProgressPercentage(0);

        project = projectRepository.save(project);

        activityLogService.logActivity(ws, currentUser, "CREATE", "PROJECT", project.getId(), null, project.getTitle());

        return ProjectDto.fromEntity(project);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "projectSummaries"}, allEntries = true)
    public ProjectDto updateProject(Long id, ProjectCreateRequest req, User currentUser) {
        Project project = projectRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));

        String oldTitle = project.getTitle();
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        if (req.getStatus() != null) project.setStatus(req.getStatus());
        if (req.getPriority() != null) project.setPriority(req.getPriority());
        project.setStartDate(req.getStartDate());
        project.setDueDate(req.getDueDate());

        if (req.getTeamId() != null) {
            teamRepository.findById(req.getTeamId()).ifPresent(project::setTeam);
        }
        if (req.getManagerId() != null) {
            userRepository.findById(req.getManagerId()).ifPresent(project::setManager);
        }

        project = projectRepository.save(project);

        activityLogService.logActivity(project.getWorkspace(), currentUser, "UPDATE", "PROJECT", project.getId(), oldTitle, project.getTitle());

        return ProjectDto.fromEntity(project);
    }

    @Transactional
    @CacheEvict(value = {"dashboardAnalytics", "projectSummaries"}, allEntries = true)
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));

        activityLogService.logActivity(project.getWorkspace(), currentUser, "DELETE", "PROJECT", id, project.getTitle(), null);
        projectRepository.delete(project);
    }
}
