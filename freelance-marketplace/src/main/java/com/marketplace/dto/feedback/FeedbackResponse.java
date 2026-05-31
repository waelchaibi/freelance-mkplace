package com.marketplace.dto.feedback;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        Long orderId,
        Long clientId,
        String clientName,
        Long adminId,
        String adminName,
        Long freelancerId,
        String freelancerName,
        int rating,
        Integer qualityScore,
        Integer communicationScore,
        Integer timelinessScore,
        boolean adminCreated,
        String comment,
        Instant createdAt
) {
}
