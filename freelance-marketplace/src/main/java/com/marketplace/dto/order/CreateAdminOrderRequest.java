package com.marketplace.dto.order;

import com.marketplace.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateAdminOrderRequest(
        @NotNull Long clientId,
        Long serviceId,
        @Size(max = 200) String title,
        @Size(max = 100) String technology,
        @NotBlank String description,
        LocalDate deadline,
        Long assignedFreelancerId,
        OrderStatus status
) {
}
