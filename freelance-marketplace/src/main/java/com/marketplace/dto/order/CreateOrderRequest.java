package com.marketplace.dto.order;

import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
        Long serviceId,
        @NotBlank String description
) {
}
