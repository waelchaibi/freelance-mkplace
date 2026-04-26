package com.marketplace.controller;

import com.marketplace.dto.service.CreateServiceRequest;
import com.marketplace.dto.service.ServiceResponse;
import com.marketplace.service.MarketplaceServiceService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final MarketplaceServiceService serviceService;

    @GetMapping
    public List<ServiceResponse> getAll() {
        return serviceService.getAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ServiceResponse create(@Valid @RequestBody CreateServiceRequest request, Authentication authentication) {
        return serviceService.create(request, authentication);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceResponse approve(@PathVariable Long id) {
        return serviceService.approve(id);
    }
}
