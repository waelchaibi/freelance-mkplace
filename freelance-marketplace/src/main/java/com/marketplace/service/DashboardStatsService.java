package com.marketplace.service;

import com.marketplace.dto.dashboard.ClientStatsResponse;
import com.marketplace.dto.dashboard.FreelancerStatsResponse;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.exception.ApiException;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardStatsService {

    private final CurrentUserService currentUserService;
    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final MessageRepository messageRepository;
    private final FeedbackRepository feedbackRepository;

    public ClientStatsResponse getClientStats(Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException("Only clients can access client stats");
        }

        var orders = orderRepository.findByClient(client);
        long completed = orders.stream().filter(o -> o.getStatus() == OrderStatus.DONE).count();
        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long inProgress = orders.stream().filter(o -> o.getStatus() == OrderStatus.IN_PROGRESS).count();

        return new ClientStatsResponse(
                orders.size(),
                orders.size(),
                completed,
                pending,
                inProgress,
                messageRepository.countByReceiverAndReadAtIsNull(client)
        );
    }

    public FreelancerStatsResponse getFreelancerStats(Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can access freelancer stats");
        }

        var orders = orderRepository.findByAssignedFreelancer(freelancer);
        var services = serviceRepository.findByFreelancer(freelancer);
        var feedbacks = feedbackRepository.findByFreelancerOrderByCreatedAtDesc(freelancer);

        return new FreelancerStatsResponse(
                orders.size(),
                orders.stream().filter(o -> o.getStatus() == OrderStatus.IN_PROGRESS).count(),
                orders.stream().filter(o -> o.getStatus() == OrderStatus.DONE).count(),
                services.stream().filter(s -> s.getStatus() == ServiceStatus.PENDING).count(),
                services.stream().filter(s -> s.getStatus() == ServiceStatus.APPROVED).count(),
                feedbackRepository.averageRatingByFreelancer(freelancer),
                feedbacks.size(),
                messageRepository.countByReceiverAndReadAtIsNull(freelancer)
        );
    }
}
