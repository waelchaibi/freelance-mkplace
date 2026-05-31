package com.marketplace.dto.dashboard;

public record ClientStatsResponse(
        long totalOrders,
        long submittedOrders,
        long completedOrders,
        long pendingOrders,
        long inProgressOrders,
        long unreadMessages
) {
}
