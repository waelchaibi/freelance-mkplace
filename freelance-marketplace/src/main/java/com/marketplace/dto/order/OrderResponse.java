package com.marketplace.dto.order;

import com.marketplace.entity.enums.OrderStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderResponse(
        Long id,
        Long clientId,
        String clientName,
        Long serviceId,
        String serviceTitle,
        String title,
        String technology,
        String description,
        OrderStatus status,
        int progressPercent,
        Long assignedFreelancerId,
        String assignedFreelancerName,
        LocalDate deadline,
        Instant createdAt,
        List<OrderTimelineEvent> timeline,
        FreelancerSummaryResponse assignedFreelancer
) {
}
