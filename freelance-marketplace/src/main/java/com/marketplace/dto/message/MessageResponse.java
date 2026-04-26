package com.marketplace.dto.message;

import java.time.Instant;

public record MessageResponse(
        Long id,
        Long orderId,
        Long senderId,
        String senderName,
        Long receiverId,
        String receiverName,
        String content,
        Instant createdAt
) {
}
