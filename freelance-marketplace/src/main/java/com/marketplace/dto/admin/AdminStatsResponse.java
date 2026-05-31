package com.marketplace.dto.admin;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        Map<String, Long> ordersByStatus,
        Map<String, Long> usersByRole,
        Map<String, Long> servicesByStatus,
        long activeProjects,
        long unreadNotifications,
        long totalFeedbacks,
        double averageFeedbackRating,
        long totalMessages,
        long unreadMessages,
        List<ActivityDataPoint> activityLast7Days
) {
}
