package com.marketplace.controller;

import com.marketplace.dto.common.PagedResponse;
import com.marketplace.dto.order.AssignFreelancerRequest;
import com.marketplace.dto.order.CreateAdminOrderRequest;
import com.marketplace.dto.order.CreateOrderRequest;
import com.marketplace.dto.order.OrderResponse;
import com.marketplace.dto.order.UpdateOrderProgressRequest;
import com.marketplace.dto.order.UpdateOrderRequest;
import com.marketplace.dto.order.UpdateOrderStatusRequest;
import com.marketplace.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
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

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createByAdmin(@Valid @RequestBody CreateAdminOrderRequest request) {
        return orderService.createByAdmin(request);
    }

    @GetMapping("/client")
    @PreAuthorize("hasRole('CLIENT')")
    public Object getClientOrders(
            Authentication authentication,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        if (page != null) {
            return orderService.getClientOrders(authentication, page, size);
        }
        return orderService.getClientOrders(authentication);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Object getAdminOrders(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        if (page != null) {
            return orderService.getAdminOrders(page, size);
        }
        return orderService.getAdminOrders();
    }

    @GetMapping("/freelancer")
    @PreAuthorize("hasRole('FREELANCER')")
    public Object getFreelancerOrders(
            Authentication authentication,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        if (page != null) {
            return orderService.getFreelancerOrders(authentication, page, size);
        }
        return orderService.getFreelancerOrders(authentication);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT','FREELANCER')")
    public OrderResponse getById(@PathVariable Long id, Authentication authentication) {
        return orderService.getOrderById(id, authentication);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse update(@PathVariable Long id, @Valid @RequestBody UpdateOrderRequest request) {
        return orderService.updateByAdmin(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderService.deleteByAdmin(id);
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

    @PutMapping("/{id}/progress")
    @PreAuthorize("hasRole('FREELANCER')")
    public OrderResponse updateProgress(@PathVariable Long id,
                                        @Valid @RequestBody UpdateOrderProgressRequest request,
                                        Authentication authentication) {
        return orderService.updateProgress(id, request, authentication);
    }
}
