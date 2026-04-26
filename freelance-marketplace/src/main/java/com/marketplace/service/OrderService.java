package com.marketplace.service;

import com.marketplace.dto.order.AssignFreelancerRequest;
import com.marketplace.dto.order.CreateOrderRequest;
import com.marketplace.dto.order.OrderResponse;
import com.marketplace.dto.order.UpdateOrderStatusRequest;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ServiceRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public OrderResponse create(CreateOrderRequest request, Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException("Only clients can create orders");
        }

        ServiceEntity service = null;
        if (request.serviceId() != null) {
            service = serviceRepository.findById(request.serviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        }

        OrderEntity order = OrderEntity.builder()
                .client(client)
                .service(service)
                .description(request.description())
                .status(OrderStatus.PENDING)
                .assignedFreelancer(null)
                .build();

        return mapToResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getClientOrders(Authentication authentication) {
        User client = currentUserService.getCurrentUser(authentication);
        return orderRepository.findByClient(client).stream().map(this::mapToResponse).toList();
    }

    public List<OrderResponse> getAdminOrders() {
        return orderRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public OrderResponse assignFreelancer(Long orderId, AssignFreelancerRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        User freelancer = userRepository.findById(request.freelancerId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Assigned user must be a freelancer");
        }

        order.setAssignedFreelancer(freelancer);
        order.setStatus(OrderStatus.ASSIGNED);
        return mapToResponse(orderRepository.save(order));
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

        if (request.status() == OrderStatus.ASSIGNED && order.getAssignedFreelancer() == null) {
            throw new ApiException("Order cannot be ASSIGNED without an assigned freelancer");
        }
        if ((request.status() == OrderStatus.IN_PROGRESS || request.status() == OrderStatus.DONE)
                && order.getAssignedFreelancer() == null) {
            throw new ApiException("Order must have an assigned freelancer first");
        }

        order.setStatus(request.status());
        return mapToResponse(orderRepository.save(order));
    }

    public OrderEntity getById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private OrderResponse mapToResponse(OrderEntity order) {
        return new OrderResponse(
                order.getId(),
                order.getClient().getId(),
                order.getClient().getName(),
                order.getService() != null ? order.getService().getId() : null,
                order.getService() != null ? order.getService().getTitle() : null,
                order.getDescription(),
                order.getStatus(),
                order.getAssignedFreelancer() != null ? order.getAssignedFreelancer().getId() : null,
                order.getAssignedFreelancer() != null ? order.getAssignedFreelancer().getName() : null
        );
    }
}
