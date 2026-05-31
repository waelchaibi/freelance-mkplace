package com.marketplace.dto.order;

import com.marketplace.entity.enums.OrderStatus;

import java.time.Instant;

public record OrderTimelineEvent(
        String label,
        OrderStatus status,
        Instant occurredAt
) {
}
