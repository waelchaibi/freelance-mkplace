package com.marketplace.service;

import com.marketplace.dto.notification.AdminNotificationLogResponse;
import com.marketplace.dto.notification.NotificationResponse;
import com.marketplace.entity.Notification;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.EmailDeliveryStatus;
import com.marketplace.entity.enums.NotificationType;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;

    public void notifyUser(User user, NotificationType type, String title, String message, Long referenceId) {
        EmailDeliveryStatus emailStatus = simulateEmailDelivery();

        Notification notification = notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .read(false)
                .emailDeliveryStatus(emailStatus)
                .build());

        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSend("/topic/users/" + user.getId() + "/notifications", response);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminNotificationLogResponse> getSentHistory(Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        return notificationRepository.findAllWithUserOrderByCreatedAtDesc().stream()
                .map(n -> new AdminNotificationLogResponse(
                        n.getId(),
                        n.getUser().getId(),
                        n.getUser().getName(),
                        n.getUser().getEmail(),
                        n.getType(),
                        n.getTitle(),
                        n.getMessage(),
                        n.isRead(),
                        n.getEmailDeliveryStatus(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public NotificationResponse markAsRead(Long notificationId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ApiException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(n -> !n.isRead())
                .forEach(n -> n.setRead(true));
    }

    private EmailDeliveryStatus simulateEmailDelivery() {
        return ThreadLocalRandom.current().nextInt(100) < 92
                ? EmailDeliveryStatus.SENT
                : EmailDeliveryStatus.FAILED;
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getEmailDeliveryStatus(),
                notification.getCreatedAt()
        );
    }
}
