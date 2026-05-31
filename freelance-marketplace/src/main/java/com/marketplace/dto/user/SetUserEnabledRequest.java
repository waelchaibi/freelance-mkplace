package com.marketplace.dto.user;

import jakarta.validation.constraints.NotNull;

public record SetUserEnabledRequest(
        @NotNull Boolean enabled
) {
}
