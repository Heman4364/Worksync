package com.worksync.service;

import com.worksync.dto.NotificationDto;
import com.worksync.entity.Notification;
import com.worksync.entity.NotificationCategory;
import com.worksync.entity.User;
import com.worksync.exception.ResourceNotFoundException;
import com.worksync.repository.NotificationRepository;
import com.worksync.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public NotificationDto createNotification(Long userId, String title, String message, NotificationCategory category, String linkUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Notification notification = new Notification(user, title, message, category, linkUrl);
        notification = notificationRepository.save(notification);

        NotificationDto dto = NotificationDto.fromEntity(notification);

        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, dto);
            messagingTemplate.convertAndSend("/topic/notifications", dto);
        } catch (Exception e) {
            log.warn("Could not dispatch WebSocket notification message: {}", e.getMessage());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getRecentUserNotifications(Long userId) {
        return notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadStatusFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.isReadStatus())
                .collect(Collectors.toList());
        for (Notification n : unread) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(unread);
    }
}
