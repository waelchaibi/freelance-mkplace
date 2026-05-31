package com.marketplace.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateOrderRequest(
        Long serviceId,
        @Size(max = 200) String title,
        @Size(max = 100) String technology,
        @NotBlank String description,
        LocalDate deadline
) {
}
