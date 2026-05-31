package com.marketplace.service;

import com.marketplace.dto.admin.ActivityDataPoint;
import com.marketplace.dto.admin.AdminStatsResponse;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.NotificationRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ServiceRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationRepository notificationRepository;
    private final FeedbackRepository feedbackRepository;
    private final MessageRepository messageRepository;
    private final CurrentUserService currentUserService;

    public AdminStatsResponse getStats(Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            usersByRole.put(role.name(), userRepository.countByRole(role));
        }

        Map<String, Long> servicesByStatus = new LinkedHashMap<>();
        for (ServiceStatus status : ServiceStatus.values()) {
            servicesByStatus.put(status.name(), serviceRepository.countByStatus(status));
        }

        long activeProjects = orderRepository.countByStatusIn(
                List.of(OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS)
        );

        long unreadNotifications = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead())
                .count();

        long unreadMessages = messageRepository.findAll().stream()
                .filter(m -> m.getReadAt() == null)
                .count();

        return new AdminStatsResponse(
                ordersByStatus,
                usersByRole,
                servicesByStatus,
                activeProjects,
                unreadNotifications,
                feedbackRepository.count(),
                feedbackRepository.averageRating(),
                messageRepository.count(),
                unreadMessages,
                buildActivityLast7Days()
        );
    }

    private List<ActivityDataPoint> buildActivityLast7Days() {
        List<ActivityDataPoint> points = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE dd");

        var orders = orderRepository.findAll();
        var messages = messageRepository.findAll();

        for (int daysAgo = 6; daysAgo >= 0; daysAgo--) {
            LocalDate day = LocalDate.now().minusDays(daysAgo);
            Instant start = day.atStartOfDay(ZoneOffset.UTC).toInstant();
            Instant end = day.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

            long orderCount = orders.stream()
                    .filter(o -> o.getCreatedAt() != null
                            && !o.getCreatedAt().isBefore(start)
                            && o.getCreatedAt().isBefore(end))
                    .count();

            long messageCount = messages.stream()
                    .filter(m -> m.getCreatedAt() != null
                            && !m.getCreatedAt().isBefore(start)
                            && m.getCreatedAt().isBefore(end))
                    .count();

            points.add(new ActivityDataPoint(day.format(formatter), orderCount, messageCount));
        }

        return points;
    }
}
