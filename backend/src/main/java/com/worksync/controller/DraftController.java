package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.DraftDtos.*;
import com.worksync.entity.SocialPlatform;
import com.worksync.entity.User;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.UserRepository;
import com.worksync.security.UserPrincipal;
import com.worksync.service.DraftService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drafts")
public class DraftController {

    private final DraftService draftService;
    private final UserRepository userRepository;

    public DraftController(DraftService draftService, UserRepository userRepository) {
        this.draftService = draftService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DraftDto>>> getDrafts(
            @RequestParam Long workspaceId,
            @RequestParam(required = false) SocialPlatform platform,
            @RequestParam(required = false) String query,
            @PageableDefault(page = 0, size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<DraftDto> drafts = draftService.getDrafts(workspaceId, platform, query, pageable);
        return ResponseEntity.ok(ApiResponse.success(drafts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DraftDto>> getDraftById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(draftService.getDraftById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DraftDto>> createDraft(
            @Valid @RequestBody DraftCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DraftDto draft = draftService.createDraft(request, user);
        return ResponseEntity.ok(ApiResponse.success(draft, "Draft saved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DraftDto>> updateDraft(
            @PathVariable Long id,
            @Valid @RequestBody DraftCreateRequest request) {
        DraftDto draft = draftService.updateDraft(id, request);
        return ResponseEntity.ok(ApiResponse.success(draft, "Draft updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDraft(@PathVariable Long id) {
        draftService.deleteDraft(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Draft deleted successfully"));
    }
}
