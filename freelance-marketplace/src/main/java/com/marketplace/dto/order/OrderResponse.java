package com.marketplace.dto.order;

import com.marketplace.entity.enums.OrderStatus;

public record OrderResponse(
        Long id,
        Long clientId,
        String clientName,
        Long serviceId,
        String serviceTitle,
        String description,
        OrderStatus status,
        Long assignedFreelancerId,
        String assignedFreelancerName
) {
}
