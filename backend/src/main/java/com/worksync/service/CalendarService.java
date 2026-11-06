package com.worksync.service;

import com.worksync.dto.CalendarEventDtos.*;
import com.worksync.entity.CalendarEvent;
import com.worksync.entity.EventType;
import com.worksync.entity.User;
import com.worksync.entity.Workspace;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.CalendarEventRepository;
import com.worksync.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    private final CalendarEventRepository calendarRepository;
    private final WorkspaceRepository workspaceRepository;

    public CalendarService(CalendarEventRepository calendarRepository, WorkspaceRepository workspaceRepository) {
        this.calendarRepository = calendarRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @Transactional(readOnly = true)
    public List<CalendarEventDto> getEvents(Long workspaceId, LocalDateTime start, LocalDateTime end) {
        List<CalendarEvent> events;
        if (start != null && end != null) {
            events = calendarRepository.findByWorkspaceIdAndStartTimeBetween(workspaceId, start, end);
        } else {
            events = calendarRepository.findByWorkspaceId(workspaceId);
        }
        return events.stream().map(CalendarEventDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDto createEvent(CalendarEventCreateRequest req, User user) {
        Workspace ws = workspaceRepository.findById(req.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + req.getWorkspaceId()));

        CalendarEvent event = new CalendarEvent();
        event.setWorkspace(ws);
        event.setUser(user);
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setEventType(req.getEventType() != null ? req.getEventType() : EventType.CUSTOM);
        event.setStartTime(req.getStartTime());
        event.setEndTime(req.getEndTime());
        event.setReferenceId(req.getReferenceId());
        event.setColor(req.getColor() != null ? req.getColor() : "#6366f1");
        event.setAllDay(req.isAllDay());

        event = calendarRepository.save(event);
        return CalendarEventDto.fromEntity(event);
    }

    @Transactional
    public CalendarEventDto updateEvent(Long id, CalendarEventCreateRequest req) {
        CalendarEvent event = calendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found: " + id));

        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        if (req.getEventType() != null) event.setEventType(req.getEventType());
        event.setStartTime(req.getStartTime());
        event.setEndTime(req.getEndTime());
        if (req.getColor() != null) event.setColor(req.getColor());
        event.setAllDay(req.isAllDay());

        event = calendarRepository.save(event);
        return CalendarEventDto.fromEntity(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        CalendarEvent event = calendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found: " + id));
        calendarRepository.delete(event);
    }
}
