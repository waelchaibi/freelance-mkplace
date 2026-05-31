package com.marketplace.dto.order;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateOrderProgressRequest(
        @Min(0) @Max(100) int progressPercent
) {
}
