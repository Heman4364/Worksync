package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.AuthDtos.*;
import com.worksync.security.UserPrincipal;
import com.worksync.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Authentication successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request,
                                                                  HttpServletResponse response) {
        AuthResponse authResponse = authService.refreshToken(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshTokenRequest request,
                                                    HttpServletResponse response) {
        String token = request != null ? request.getRefreshToken() : null;
        authService.logout(token);

        // Clear cookies
        ResponseCookie clearAccess = ResponseCookie.from("jwt_access_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());

        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                            @Valid @RequestBody PasswordChangeRequest request) {
        authService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        ResponseCookie cookie = ResponseCookie.from("jwt_access_token", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(false) // Set to true in production over HTTPS
                .path("/")
                .maxAge(authResponse.getExpiresIn() / 1000)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
