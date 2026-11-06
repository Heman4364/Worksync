package com.worksync.controller;

import com.worksync.dto.ApiResponse;
import com.worksync.dto.CalendarEventDtos.*;
import com.worksync.entity.User;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.UserRepository;
import com.worksync.security.UserPrincipal;
import com.worksync.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar/events")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;

    public CalendarController(CalendarService calendarService, UserRepository userRepository) {
        this.calendarService = calendarService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getEvents(
            @RequestParam Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<CalendarEventDto> events = calendarService.getEvents(workspaceId, start, end);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CalendarEventDto>> createEvent(
            @Valid @RequestBody CalendarEventCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CalendarEventDto event = calendarService.createEvent(request, user);
        return ResponseEntity.ok(ApiResponse.success(event, "Calendar event created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CalendarEventDto>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CalendarEventCreateRequest request) {
        CalendarEventDto event = calendarService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(event, "Calendar event updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Calendar event deleted"));
    }
}
