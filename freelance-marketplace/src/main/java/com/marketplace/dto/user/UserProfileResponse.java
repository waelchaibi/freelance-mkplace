package com.marketplace.dto.user;

import com.marketplace.entity.enums.AvailabilityStatus;
import com.marketplace.entity.enums.Role;

import java.math.BigDecimal;
import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean enabled,
        String specialty,
        Integer yearsOfExperience,
        BigDecimal dailyRate,
        AvailabilityStatus availability,
        String skills,
        String cvUrl,
        Instant cvUploadedAt,
        Double averageRating
) {
}
