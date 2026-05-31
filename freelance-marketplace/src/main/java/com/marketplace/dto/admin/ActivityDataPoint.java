package com.marketplace.dto.admin;

public record ActivityDataPoint(
        String label,
        long orders,
        long messages
) {
}
