package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.SocialDtos.*;
import com.worksync.entity.User;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.UserRepository;
import com.worksync.security.UserPrincipal;
import com.worksync.service.SocialPostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class SocialPostController {

    private final SocialPostService postService;
    private final UserRepository userRepository;

    public SocialPostController(SocialPostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<PostValidationResultDto>> validatePost(@Valid @RequestBody PostValidateRequest request) {
        PostValidationResultDto result = postService.validatePost(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDto>>> getPosts(
            @RequestParam Long workspaceId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<PostDto> page = postService.getWorkspacePosts(workspaceId, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDto>> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPostById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostDto>> createPost(
            @Valid @RequestBody PostCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PostDto post = postService.createPost(request, user);
        return ResponseEntity.ok(ApiResponse.success(post, "Post created and queued for publication"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        postService.deletePost(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted successfully"));
    }
}
