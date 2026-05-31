package com.marketplace.dto.notification;

import com.marketplace.entity.enums.EmailDeliveryStatus;
import com.marketplace.entity.enums.NotificationType;

import java.time.Instant;

public record AdminNotificationLogResponse(
        Long id,
        Long recipientId,
        String recipientName,
        String recipientEmail,
        NotificationType type,
        String title,
        String message,
        boolean read,
        EmailDeliveryStatus emailDeliveryStatus,
        Instant createdAt
) {
}
