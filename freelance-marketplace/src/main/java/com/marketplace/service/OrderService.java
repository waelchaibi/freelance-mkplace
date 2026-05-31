package com.marketplace.service;

import com.marketplace.dto.common.PagedResponse;
import com.marketplace.dto.order.AssignFreelancerRequest;
import com.marketplace.dto.order.CreateAdminOrderRequest;
import com.marketplace.dto.order.CreateOrderRequest;
import com.marketplace.dto.order.FreelancerSummaryResponse;
import com.marketplace.dto.order.OrderResponse;
import com.marketplace.dto.order.OrderTimelineEvent;
import com.marketplace.dto.order.UpdateOrderProgressRequest;
import com.marketplace.dto.order.UpdateOrderRequest;
import com.marketplace.dto.order.UpdateOrderStatusRequest;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.NotificationType;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ServiceRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final FeedbackRepository feedbackRepository;

    public OrderResponse create(CreateOrderRequest request, Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException("Only clients can create orders");
        }

        ServiceEntity service = resolveService(request.serviceId());
        String title = resolveTitle(request.title(), service, request.description());

        OrderEntity order = OrderEntity.builder()
                .client(client)
                .service(service)
                .title(title)
                .technology(request.technology())
                .description(request.description())
                .status(OrderStatus.PENDING)
                .progressPercent(0)
                .deadline(request.deadline())
                .build();

        OrderEntity saved = orderRepository.save(order);
        notifyAdmins(
                NotificationType.ORDER_CREATED,
                "New order submitted",
                client.getName() + " created order #" + saved.getId(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public OrderResponse createByAdmin(CreateAdminOrderRequest request) {
        User client = userRepository.findById(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException("Selected user must be a client");
        }

        ServiceEntity service = resolveService(request.serviceId());
        User freelancer = resolveFreelancer(request.assignedFreelancerId());
        OrderStatus status = request.status() != null ? request.status() : OrderStatus.PENDING;
        String title = resolveTitle(request.title(), service, request.description());

        OrderEntity order = OrderEntity.builder()
                .client(client)
                .service(service)
                .title(title)
                .technology(request.technology())
                .description(request.description())
                .status(status)
                .assignedFreelancer(freelancer)
                .deadline(request.deadline())
                .progressPercent(0)
                .build();

        applyStatusTimestamps(order, status);
        OrderEntity saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    public OrderResponse updateByAdmin(Long orderId, UpdateOrderRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (request.title() != null) {
            order.setTitle(request.title());
        }
        if (request.technology() != null) {
            order.setTechnology(request.technology());
        }
        if (request.description() != null) {
            order.setDescription(request.description());
        }
        if (request.deadline() != null) {
            order.setDeadline(request.deadline());
        }
        if (request.assignedFreelancerId() != null) {
            User freelancer = resolveFreelancer(request.assignedFreelancerId());
            order.setAssignedFreelancer(freelancer);
        }
        if (request.status() != null) {
            validateStatusTransition(order, request.status());
            order.setStatus(request.status());
            applyStatusTimestamps(order, request.status());
        }

        return mapToResponse(orderRepository.save(order));
    }

    public void deleteByAdmin(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        orderRepository.delete(order);
    }

    public OrderResponse updateProgress(Long orderId, UpdateOrderProgressRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (actor.getRole() != Role.FREELANCER
                || order.getAssignedFreelancer() == null
                || !order.getAssignedFreelancer().getId().equals(actor.getId())) {
            throw new ApiException("Only the assigned freelancer can update progress");
        }

        order.setProgressPercent(request.progressPercent());
        if (request.progressPercent() > 0 && order.getStatus() == OrderStatus.ASSIGNED) {
            order.setStatus(OrderStatus.IN_PROGRESS);
            applyStatusTimestamps(order, OrderStatus.IN_PROGRESS);
        }

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getClientOrders(Authentication authentication, int page, int size) {
        User client = currentUserService.getCurrentUser(authentication);
        return toPaged(orderRepository.findByClient(client, pageRequest(page, size)));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getClientOrders(Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        return orderRepository.findByClient(client).stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAdminOrders(int page, int size) {
        Page<OrderEntity> result = orderRepository.findAll(pageRequest(page, size));
        return toPaged(result);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAdminOrders() {
        return orderRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getFreelancerOrders(Authentication authentication, int page, int size) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can access assigned orders");
        }
        return toPaged(orderRepository.findByAssignedFreelancer(freelancer, pageRequest(page, size)));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getFreelancerOrders(Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can access assigned orders");
        }
        return orderRepository.findByAssignedFreelancer(freelancer).stream().map(this::mapToResponse).toList();
    }

    public OrderResponse assignFreelancer(Long orderId, AssignFreelancerRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        User freelancer = resolveFreelancer(request.freelancerId());

        order.setAssignedFreelancer(freelancer);
        order.setStatus(OrderStatus.ASSIGNED);
        applyStatusTimestamps(order, OrderStatus.ASSIGNED);
        if (request.deadline() != null) {
            order.setDeadline(request.deadline());
        }

        OrderEntity saved = orderRepository.save(order);

        notificationService.notifyUser(
                order.getClient(),
                NotificationType.ORDER_ASSIGNED,
                "Freelancer assigned",
                freelancer.getName() + " was assigned to your order #" + saved.getId(),
                saved.getId()
        );
        notificationService.notifyUser(
                freelancer,
                NotificationType.ORDER_ASSIGNED,
                "New assignment",
                "You were assigned to order #" + saved.getId(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.FREELANCER
                    || order.getAssignedFreelancer() == null
                    || !order.getAssignedFreelancer().getId().equals(actor.getId())) {
                throw new ApiException("Only admin or assigned freelancer can update order status");
            }
        }

        validateStatusTransition(order, request.status());
        order.setStatus(request.status());
        applyStatusTimestamps(order, request.status());
        OrderEntity saved = orderRepository.save(order);

        notificationService.notifyUser(
                order.getClient(),
                NotificationType.ORDER_STATUS_CHANGED,
                "Order status updated",
                "Order #" + saved.getId() + " is now " + saved.getStatus(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderEntity getById(Long orderId) {
        return orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = getById(orderId);

        switch (actor.getRole()) {
            case ADMIN -> {
                return mapToResponse(order);
            }
            case CLIENT -> {
                if (!order.getClient().getId().equals(actor.getId())) {
                    throw new ApiException("You can only view your own orders");
                }
                return mapToResponse(order);
            }
            case FREELANCER -> {
                if (order.getAssignedFreelancer() == null
                        || !order.getAssignedFreelancer().getId().equals(actor.getId())) {
                    throw new ApiException("You can only view orders assigned to you");
                }
                return mapToResponse(order);
            }
            default -> throw new ApiException("Unauthorized");
        }
    }

    private void validateStatusTransition(OrderEntity order, OrderStatus status) {
        if (status == OrderStatus.ASSIGNED && order.getAssignedFreelancer() == null) {
            throw new ApiException("Order cannot be ASSIGNED without an assigned freelancer");
        }
        if ((status == OrderStatus.IN_PROGRESS || status == OrderStatus.DONE)
                && order.getAssignedFreelancer() == null) {
            throw new ApiException("Order must have an assigned freelancer first");
        }
    }

    private void applyStatusTimestamps(OrderEntity order, OrderStatus status) {
        Instant now = Instant.now();
        switch (status) {
            case ASSIGNED -> {
                if (order.getAssignedAt() == null) {
                    order.setAssignedAt(now);
                }
            }
            case IN_PROGRESS -> {
                if (order.getInProgressAt() == null) {
                    order.setInProgressAt(now);
                }
            }
            case DONE -> {
                if (order.getDoneAt() == null) {
                    order.setDoneAt(now);
                }
                order.setProgressPercent(100);
            }
            default -> {
            }
        }
    }

    private ServiceEntity resolveService(Long serviceId) {
        if (serviceId == null) {
            return null;
        }
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    private User resolveFreelancer(Long freelancerId) {
        if (freelancerId == null) {
            return null;
        }
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Assigned user must be a freelancer");
        }
        return freelancer;
    }

    private String resolveTitle(String title, ServiceEntity service, String description) {
        if (title != null && !title.isBlank()) {
            return title.trim();
        }
        if (service != null) {
            return service.getTitle();
        }
        String trimmed = description.trim();
        return trimmed.length() > 80 ? trimmed.substring(0, 80) + "…" : trimmed;
    }

    private Pageable pageRequest(int page, int size) {
        return PageRequest.of(page, Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private PagedResponse<OrderResponse> toPaged(Page<OrderEntity> page) {
        return new PagedResponse<>(
                page.getContent().stream().map(this::mapToResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    private void notifyAdmins(NotificationType type, String title, String message, Long referenceId) {
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationService.notifyUser(admin, type, title, message, referenceId)
        );
    }

    private List<OrderTimelineEvent> buildTimeline(OrderEntity order) {
        List<OrderTimelineEvent> events = new ArrayList<>();
        if (order.getCreatedAt() != null) {
            events.add(new OrderTimelineEvent("Projet soumis", OrderStatus.PENDING, order.getCreatedAt()));
        }
        if (order.getAssignedAt() != null) {
            events.add(new OrderTimelineEvent("Freelancer assigné", OrderStatus.ASSIGNED, order.getAssignedAt()));
        }
        if (order.getInProgressAt() != null) {
            events.add(new OrderTimelineEvent("Travaux en cours", OrderStatus.IN_PROGRESS, order.getInProgressAt()));
        }
        if (order.getDoneAt() != null) {
            events.add(new OrderTimelineEvent("Projet terminé", OrderStatus.DONE, order.getDoneAt()));
        }
        return events;
    }

    private FreelancerSummaryResponse mapFreelancerSummary(User freelancer) {
        return new FreelancerSummaryResponse(
                freelancer.getId(),
                freelancer.getName(),
                freelancer.getSpecialty(),
                freelancer.getYearsOfExperience(),
                freelancer.getDailyRate(),
                freelancer.getAvailability(),
                freelancer.getSkills(),
                feedbackRepository.averageRatingByFreelancer(freelancer)
        );
    }

    private OrderResponse mapToResponse(OrderEntity order) {
        User freelancer = order.getAssignedFreelancer();
        return new OrderResponse(
                order.getId(),
                order.getClient().getId(),
                order.getClient().getName(),
                order.getService() != null ? order.getService().getId() : null,
                order.getService() != null ? order.getService().getTitle() : null,
                order.getTitle(),
                order.getTechnology(),
                order.getDescription(),
                order.getStatus(),
                order.getProgressPercent(),
                freelancer != null ? freelancer.getId() : null,
                freelancer != null ? freelancer.getName() : null,
                order.getDeadline(),
                order.getCreatedAt(),
                buildTimeline(order),
                freelancer != null ? mapFreelancerSummary(freelancer) : null
        );
    }
}
