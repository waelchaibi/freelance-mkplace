package com.marketplace.service;

import com.marketplace.dto.common.UploadResponse;
import com.marketplace.dto.portfolio.CreatePortfolioItemRequest;
import com.marketplace.dto.portfolio.PortfolioItemResponse;
import com.marketplace.entity.PortfolioItem;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.PortfolioRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> getMyPortfolio(Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        ensureFreelancer(freelancer);
        return portfolioRepository.findByFreelancerOrderByCreatedAtDesc(freelancer).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> getByFreelancer(Long freelancerId) {
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));
        if (freelancer.getRole() != Role.FREELANCER) {
            throw new ApiException("User is not a freelancer");
        }
        return portfolioRepository.findByFreelancerOrderByCreatedAtDesc(freelancer).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public UploadResponse uploadImage(MultipartFile file, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        ensureFreelancer(freelancer);
        String stored = fileStorageService.storePortfolioImage(freelancer.getId(), file);
        return new UploadResponse("/api/files/portfolio/image/" + stored);
    }

    public UploadResponse uploadAttachment(MultipartFile file, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        ensureFreelancer(freelancer);
        String stored = fileStorageService.storePortfolioAttachment(freelancer.getId(), file);
        return new UploadResponse("/api/files/portfolio/attachment/" + stored);
    }

    public PortfolioItemResponse create(CreatePortfolioItemRequest request, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        ensureFreelancer(freelancer);

        PortfolioItem item = PortfolioItem.builder()
                .freelancer(freelancer)
                .title(request.title())
                .description(request.description())
                .projectUrl(request.projectUrl())
                .imageUrl(request.imageUrl())
                .attachmentUrl(request.attachmentUrl())
                .technologies(request.technologies())
                .build();

        return mapToResponse(portfolioRepository.save(item));
    }

    public PortfolioItemResponse update(Long id, CreatePortfolioItemRequest request, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        PortfolioItem item = getOwnedItem(id, freelancer);

        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setProjectUrl(request.projectUrl());
        item.setImageUrl(request.imageUrl());
        item.setAttachmentUrl(request.attachmentUrl());
        item.setTechnologies(request.technologies());

        return mapToResponse(portfolioRepository.save(item));
    }

    public void delete(Long id, Authentication authentication) {
        User freelancer = currentUserService.getCurrentUser(authentication);
        PortfolioItem item = getOwnedItem(id, freelancer);
        portfolioRepository.delete(item);
    }

    private PortfolioItem getOwnedItem(Long id, User freelancer) {
        PortfolioItem item = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item not found"));
        if (!item.getFreelancer().getId().equals(freelancer.getId())) {
            throw new ApiException("You can only manage your own portfolio items");
        }
        return item;
    }

    private void ensureFreelancer(User user) {
        if (user.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can manage a portfolio");
        }
    }

    private PortfolioItemResponse mapToResponse(PortfolioItem item) {
        return new PortfolioItemResponse(
                item.getId(),
                item.getFreelancer().getId(),
                item.getFreelancer().getName(),
                item.getTitle(),
                item.getDescription(),
                item.getProjectUrl(),
                item.getImageUrl(),
                item.getAttachmentUrl(),
                item.getTechnologies(),
                item.getCreatedAt()
        );
    }
}
