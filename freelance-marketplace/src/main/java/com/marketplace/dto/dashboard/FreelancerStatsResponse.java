package com.marketplace.dto.dashboard;

public record FreelancerStatsResponse(
        long assignedOrders,
        long inProgressOrders,
        long completedOrders,
        long pendingServices,
        long approvedServices,
        double averageRating,
        long reviewCount,
        long unreadMessages
) {
}
