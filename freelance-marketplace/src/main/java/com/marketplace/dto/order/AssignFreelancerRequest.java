package com.marketplace.dto.order;

import jakarta.validation.constraints.NotNull;

public record AssignFreelancerRequest(
        @NotNull Long freelancerId
) {
}
