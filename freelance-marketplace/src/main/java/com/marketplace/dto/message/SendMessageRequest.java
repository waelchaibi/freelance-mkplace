package com.marketplace.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendMessageRequest(
        @NotNull Long orderId,
        @NotNull Long receiverId,
        @NotBlank String content
) {
}
