package com.worksync.service;

import com.worksync.dto.AuthDtos.*;
import com.worksync.dto.UserDto;
import com.worksync.entity.*;
import com.worksync.exception.BadRequestException;
import com.worksync.exception.DuplicateEntityException;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.exception.UnauthorizedException;
import com.worksync.repository.RefreshTokenRepository;
import com.worksync.repository.UserRepository;
import com.worksync.repository.WorkspaceMemberRepository;
import com.worksync.repository.WorkspaceRepository;
import com.worksync.security.JwtTokenProvider;
import com.worksync.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${worksync.security.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Value("${worksync.security.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       WorkspaceRepository workspaceRepository,
                       WorkspaceMemberRepository workspaceMemberRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntityException("An account with email " + request.getEmail() + " already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_MEMBER;

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName(),
                role
        );
        user = userRepository.save(user);

        // Auto-create initial workspace for user
        String wsName = (request.getWorkspaceName() != null && !request.getWorkspaceName().trim().isEmpty())
                ? request.getWorkspaceName().trim()
                : (request.getFirstName() != null ? request.getFirstName() + "'s Workspace" : "Main Workspace");
        String cleanSlug = wsName.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (cleanSlug.isEmpty() || cleanSlug.equals("-")) {
            cleanSlug = "workspace";
        }
        String wsSlug = cleanSlug + "-" + UUID.randomUUID().toString().substring(0, 5);
        if (wsSlug.startsWith("-")) {
            wsSlug = "ws" + wsSlug;
        }

        Workspace workspace = new Workspace(wsName, wsSlug, "Default workspace created on signup", user);
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(workspace, user, role);
        workspaceMemberRepository.save(member);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        RefreshToken refreshToken = createRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                accessTokenExpirationMs,
                UserDto.fromEntity(user),
                workspace.getId()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        RefreshToken refreshToken = createRefreshToken(user);

        // Find user's default workspace
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserIdWithWorkspace(user.getId());
        Long defaultWorkspaceId = !memberships.isEmpty() ? memberships.get(0).getWorkspace().getId() : null;

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                accessTokenExpirationMs,
                UserDto.fromEntity(user),
                defaultWorkspaceId
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token is expired or has been revoked");
        }

        User user = refreshToken.getUser();

        // Refresh token rotation: delete old token and create a fresh one
        refreshTokenRepository.delete(refreshToken);
        RefreshToken newRefreshToken = createRefreshToken(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);

        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserIdWithWorkspace(user.getId());
        Long defaultWorkspaceId = !memberships.isEmpty() ? memberships.get(0).getWorkspace().getId() : null;

        return new AuthResponse(
                newAccessToken,
                newRefreshToken.getToken(),
                accessTokenExpirationMs,
                UserDto.fromEntity(user),
                defaultWorkspaceId
        );
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.trim().isEmpty()) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(refreshTokenRepository::delete);
        }
        SecurityContextHolder.clearContext();
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all active refresh tokens for this user on password change
        refreshTokenRepository.deleteByUser(user);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken token = new RefreshToken(
                UUID.randomUUID().toString(),
                user,
                Instant.now().plusMillis(refreshTokenExpirationMs)
        );
        return refreshTokenRepository.save(token);
    }
}
