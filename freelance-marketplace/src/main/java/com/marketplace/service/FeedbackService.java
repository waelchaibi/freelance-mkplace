package com.marketplace.service;

import com.marketplace.dto.feedback.CreateAdminFeedbackRequest;
import com.marketplace.dto.feedback.CreateFeedbackRequest;
import com.marketplace.dto.feedback.FeedbackResponse;
import com.marketplace.entity.Feedback;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.NotificationType;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public FeedbackResponse create(CreateFeedbackRequest request, Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException("Only clients can leave feedback");
        }

        OrderEntity order = orderService.getById(request.orderId());
        if (!order.getClient().getId().equals(client.getId())) {
            throw new ApiException("You can only review your own orders");
        }
        if (order.getStatus() != OrderStatus.DONE) {
            throw new ApiException("Feedback is only allowed on completed orders");
        }
        if (order.getAssignedFreelancer() == null) {
            throw new ApiException("Order has no assigned freelancer");
        }
        if (feedbackRepository.existsByOrder(order)) {
            throw new ApiException("Feedback already submitted for this order");
        }

        User freelancer = order.getAssignedFreelancer();
        Feedback feedback = feedbackRepository.save(Feedback.builder()
                .order(order)
                .client(client)
                .freelancer(freelancer)
                .rating(request.rating())
                .qualityScore(request.qualityScore())
                .communicationScore(request.communicationScore())
                .timelinessScore(request.timelinessScore())
                .comment(request.comment())
                .adminCreated(false)
                .build());

        notifyFreelancer(freelancer, client.getName(), request.rating(), order.getId());
        return mapToResponse(feedback);
    }

    public FeedbackResponse createByAdmin(CreateAdminFeedbackRequest request, Authentication authentication) {
        User admin = currentUserService.getCurrentUser(authentication);
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException("Only admins can create evaluations");
        }

        User freelancer = userRepository.findById(request.freelancerId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("User is not a freelancer");
        }

        OrderEntity order = null;
        if (request.orderId() != null) {
            order = orderService.getById(request.orderId());
            if (order.getAssignedFreelancer() == null
                    || !order.getAssignedFreelancer().getId().equals(freelancer.getId())) {
                throw new ApiException("Order is not assigned to this freelancer");
            }
            if (feedbackRepository.existsByOrder(order)) {
                throw new ApiException("Feedback already exists for this order");
            }
        }

        Feedback feedback = feedbackRepository.save(Feedback.builder()
                .order(order)
                .admin(admin)
                .freelancer(freelancer)
                .rating(request.rating())
                .qualityScore(request.qualityScore())
                .communicationScore(request.communicationScore())
                .timelinessScore(request.timelinessScore())
                .comment(request.comment())
                .adminCreated(true)
                .build());

        notifyFreelancer(freelancer, admin.getName(), request.rating(), order != null ? order.getId() : null);
        return mapToResponse(feedback);
    }

    @Transactional(readOnly = true)
    public FeedbackResponse getByOrder(Long orderId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderService.getById(orderId);
        ensureCanViewOrderFeedback(actor, order);

        return feedbackRepository.findByOrder(order)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAll() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getByFreelancer(Long freelancerId) {
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("User is not a freelancer");
        }
        return feedbackRepository.findByFreelancerOrderByCreatedAtDesc(freelancer).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMyFeedbacks(Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can view their feedbacks");
        }
        return feedbackRepository.findByFreelancerOrderByCreatedAtDesc(freelancer).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void notifyFreelancer(User freelancer, String authorName, int rating, Long orderId) {
        notificationService.notifyUser(
                freelancer,
                NotificationType.FEEDBACK_RECEIVED,
                "New feedback received",
                authorName + " left a " + rating + "-star review"
                        + (orderId != null ? " on order #" + orderId : ""),
                orderId
        );
    }

    private void ensureCanViewOrderFeedback(User actor, OrderEntity order) {
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        if (actor.getRole() == Role.CLIENT && order.getClient().getId().equals(actor.getId())) {
            return;
        }
        if (actor.getRole() == Role.FREELANCER
                && order.getAssignedFreelancer() != null
                && order.getAssignedFreelancer().getId().equals(actor.getId())) {
            return;
        }
        throw new ApiException("You cannot view feedback for this order");
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getOrder() != null ? feedback.getOrder().getId() : null,
                feedback.getClient() != null ? feedback.getClient().getId() : null,
                feedback.getClient() != null ? feedback.getClient().getName() : null,
                feedback.getAdmin() != null ? feedback.getAdmin().getId() : null,
                feedback.getAdmin() != null ? feedback.getAdmin().getName() : null,
                feedback.getFreelancer().getId(),
                feedback.getFreelancer().getName(),
                feedback.getRating(),
                feedback.getQualityScore(),
                feedback.getCommunicationScore(),
                feedback.getTimelinessScore(),
                feedback.isAdminCreated(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}
