package com.worksync.service;

import com.worksync.dto.OAuthCredentialDtos.OAuthCredentialDto;
import com.worksync.dto.OAuthCredentialDtos.OAuthCredentialSaveRequest;
import com.worksync.entity.OAuthCredential;
import com.worksync.entity.SocialPlatform;
import com.worksync.entity.Workspace;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.OAuthCredentialRepository;
import com.worksync.repository.WorkspaceRepository;
import com.worksync.security.AesEncryptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OAuthCredentialService {

    private final OAuthCredentialRepository credentialRepository;
    private final WorkspaceRepository workspaceRepository;
    private final AesEncryptionService aesEncryptionService;

    public OAuthCredentialService(OAuthCredentialRepository credentialRepository,
                                  WorkspaceRepository workspaceRepository,
                                  AesEncryptionService aesEncryptionService) {
        this.credentialRepository = credentialRepository;
        this.workspaceRepository = workspaceRepository;
        this.aesEncryptionService = aesEncryptionService;
    }

    @Transactional
    public OAuthCredentialDto saveCredential(OAuthCredentialSaveRequest req) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        AesEncryptionService.EncryptionResult secretEnc = aesEncryptionService.encrypt(req.getClientSecret());

        String encToken = null;
        if (req.getAccessToken() != null && !req.getAccessToken().trim().isEmpty()) {
            AesEncryptionService.EncryptionResult tokenEnc = aesEncryptionService.encrypt(req.getAccessToken());
            encToken = tokenEnc.getCipherText();
        }

        Optional<OAuthCredential> existing = credentialRepository.findByWorkspaceIdAndPlatform(req.getWorkspaceId(), req.getPlatform());
        OAuthCredential cred = existing.orElseGet(OAuthCredential::new);

        cred.setWorkspace(ws);
        cred.setPlatform(req.getPlatform());
        cred.setClientId(req.getClientId());
        cred.setEncryptedClientSecret(secretEnc.getCipherText());
        cred.setIv(secretEnc.getIv());
        cred.setEncryptedAccessToken(encToken);
        cred.setActive(true);

        cred = credentialRepository.save(cred);
        return OAuthCredentialDto.fromEntity(cred);
    }

    @Transactional(readOnly = true)
    public OAuthCredentialDto getCredentialStatus(Long workspaceId, SocialPlatform platform) {
        return credentialRepository.findByWorkspaceIdAndPlatform(workspaceId, platform)
                .map(OAuthCredentialDto::fromEntity)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public String getDecryptedClientSecret(Long workspaceId, SocialPlatform platform) {
        OAuthCredential cred = credentialRepository.findByWorkspaceIdAndPlatform(workspaceId, platform)
                .orElseThrow(() -> new ResourceNotFoundException("No credentials found for platform: " + platform));
        return aesEncryptionService.decrypt(cred.getEncryptedClientSecret(), cred.getIv());
    }
}
