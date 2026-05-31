package com.marketplace.dto.user;

import com.marketplace.entity.enums.AvailabilityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email String email,
        @Size(max = 120) String specialty,
        @PositiveOrZero Integer yearsOfExperience,
        @PositiveOrZero BigDecimal dailyRate,
        AvailabilityStatus availability,
        @Size(max = 1000) String skills,
        @Size(max = 500) String cvUrl
) {
}
