package com.marketplace.dto.message;

import com.marketplace.entity.enums.OrderStatus;

import java.time.Instant;

public record ConversationSummaryResponse(
        Long orderId,
        String orderTitle,
        String orderDescription,
        OrderStatus orderStatus,
        String counterpartName,
        String lastMessagePreview,
        Instant lastMessageAt,
        long unreadCount
) {
}
