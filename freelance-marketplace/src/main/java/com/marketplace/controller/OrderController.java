package com.marketplace.controller;

import com.marketplace.dto.order.AssignFreelancerRequest;
import com.marketplace.dto.order.CreateOrderRequest;
import com.marketplace.dto.order.OrderResponse;
import com.marketplace.dto.order.UpdateOrderStatusRequest;
import com.marketplace.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        return orderService.create(request, authentication);
    }

    @GetMapping("/client")
    @PreAuthorize("hasRole('CLIENT')")
    public List<OrderResponse> getClientOrders(Authentication authentication) {
        return orderService.getClientOrders(authentication);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> getAdminOrders() {
        return orderService.getAdminOrders();
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse assignFreelancer(@PathVariable Long id, @Valid @RequestBody AssignFreelancerRequest request) {
        return orderService.assignFreelancer(id, request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','FREELANCER')")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody UpdateOrderStatusRequest request,
                                      Authentication authentication) {
        return orderService.updateStatus(id, request, authentication);
    }
}
