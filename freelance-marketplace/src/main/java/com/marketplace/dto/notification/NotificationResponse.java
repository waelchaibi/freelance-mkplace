package com.marketplace.dto.notification;

import com.marketplace.entity.enums.EmailDeliveryStatus;
import com.marketplace.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        Long referenceId,
        boolean read,
        EmailDeliveryStatus emailDeliveryStatus,
        Instant createdAt
) {
}
