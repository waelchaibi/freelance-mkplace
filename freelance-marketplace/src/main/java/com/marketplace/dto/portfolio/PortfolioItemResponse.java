package com.marketplace.dto.portfolio;

import java.time.Instant;

public record PortfolioItemResponse(
        Long id,
        Long freelancerId,
        String freelancerName,
        String title,
        String description,
        String projectUrl,
        String imageUrl,
        String attachmentUrl,
        String technologies,
        Instant createdAt
) {
}
