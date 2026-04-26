package com.marketplace.service;

import com.marketplace.dto.service.CreateServiceRequest;
import com.marketplace.dto.service.ServiceResponse;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceServiceService {

    private final ServiceRepository serviceRepository;
    private final CurrentUserService currentUserService;

    public List<ServiceResponse> getAll() {
        return serviceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ServiceResponse create(CreateServiceRequest request, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can create services");
        }

        ServiceEntity entity = ServiceEntity.builder()
                .freelancer(freelancer)
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .status(ServiceStatus.PENDING)
                .build();

        return mapToResponse(serviceRepository.save(entity));
    }

    public ServiceResponse approve(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setStatus(ServiceStatus.APPROVED);
        return mapToResponse(serviceRepository.save(service));
    }

    private ServiceResponse mapToResponse(ServiceEntity entity) {
        return new ServiceResponse(
                entity.getId(),
                entity.getFreelancer().getId(),
                entity.getFreelancer().getName(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getStatus()
        );
    }
}
