package com.marketplace.service;

import com.marketplace.dto.service.CreateServiceRequest;
import com.marketplace.dto.service.ServiceResponse;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.NotificationType;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.ServiceRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

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

        ServiceEntity saved = serviceRepository.save(entity);
        notifyAdmins(
                NotificationType.SERVICE_SUBMITTED,
                "Service pending validation",
                freelancer.getName() + " submitted \"" + saved.getTitle() + "\" for review",
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public ServiceResponse approve(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setStatus(ServiceStatus.APPROVED);
        ServiceEntity saved = serviceRepository.save(service);

        notificationService.notifyUser(
                saved.getFreelancer(),
                NotificationType.SERVICE_APPROVED,
                "Service approved",
                "Your service \"" + saved.getTitle() + "\" is now live",
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public ServiceResponse reject(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setStatus(ServiceStatus.REJECTED);
        ServiceEntity saved = serviceRepository.save(service);

        notificationService.notifyUser(
                saved.getFreelancer(),
                NotificationType.SERVICE_REJECTED,
                "Service rejected",
                "Your service \"" + saved.getTitle() + "\" was rejected by admin",
                saved.getId()
        );

        return mapToResponse(saved);
    }

    private void notifyAdmins(NotificationType type, String title, String message, Long referenceId) {
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationService.notifyUser(admin, type, title, message, referenceId)
        );
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
