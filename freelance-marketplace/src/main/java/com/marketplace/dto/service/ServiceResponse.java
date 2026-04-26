package com.marketplace.dto.service;

import com.marketplace.entity.enums.ServiceStatus;

import java.math.BigDecimal;

public record ServiceResponse(
        Long id,
        Long freelancerId,
        String freelancerName,
        String title,
        String description,
        BigDecimal price,
        ServiceStatus status
) {
}
