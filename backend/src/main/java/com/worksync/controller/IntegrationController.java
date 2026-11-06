package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.OAuthCredentialDtos.*;
import com.worksync.entity.SocialPlatform;
import com.worksync.service.OAuthCredentialService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {

    private final OAuthCredentialService credentialService;

    public IntegrationController(OAuthCredentialService credentialService) {
        this.credentialService = credentialService;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<OAuthCredentialDto>> getStatus(@RequestParam Long workspaceId,
                                                                     @RequestParam SocialPlatform platform) {
        OAuthCredentialDto dto = credentialService.getCredentialStatus(workspaceId, platform);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/credentials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OAuthCredentialDto>> saveCredentials(@Valid @RequestBody OAuthCredentialSaveRequest request) {
        OAuthCredentialDto dto = credentialService.saveCredential(request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Third-party platform credentials securely encrypted using AES-256-GCM"));
    }
}
