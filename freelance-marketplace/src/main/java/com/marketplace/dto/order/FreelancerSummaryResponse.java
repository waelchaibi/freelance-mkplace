package com.marketplace.dto.order;

import com.marketplace.entity.enums.AvailabilityStatus;

import java.math.BigDecimal;

public record FreelancerSummaryResponse(
        Long id,
        String name,
        String specialty,
        Integer yearsOfExperience,
        BigDecimal dailyRate,
        AvailabilityStatus availability,
        String skills,
        double averageRating
) {
}
