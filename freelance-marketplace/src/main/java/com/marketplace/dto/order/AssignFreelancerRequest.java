package com.marketplace.dto.order;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AssignFreelancerRequest(
        @NotNull Long freelancerId,
        LocalDate deadline
) {
}
