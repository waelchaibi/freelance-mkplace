package com.marketplace.dto.order;

import com.marketplace.entity.enums.OrderStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateOrderRequest(
        @Size(max = 200) String title,
        @Size(max = 100) String technology,
        @Size(max = 2000) String description,
        LocalDate deadline,
        Long assignedFreelancerId,
        OrderStatus status
) {
}
