package com.worksync.repository;

import com.worksync.entity.OAuthCredential;
import com.worksync.entity.SocialPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthCredentialRepository extends JpaRepository<OAuthCredential, Long> {
    Optional<OAuthCredential> findByWorkspaceIdAndPlatform(Long workspaceId, SocialPlatform platform);
}
