package com.marketplace.service;

import com.marketplace.dto.user.ChangePasswordRequest;
import com.marketplace.dto.user.UpdateProfileRequest;
import com.marketplace.dto.user.UserProfileResponse;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.AvailabilityStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final FeedbackRepository feedbackRepository;

    @Transactional(readOnly = true)
    public User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfileResponse getMyProfile(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return mapToProfile(user);
    }

    public UserProfileResponse getAdminContact() {
        User admin = userRepository.findFirstByRole(Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        return mapToProfile(admin);
    }

    public List<UserProfileResponse> listUsers(Role role, String specialty, AvailabilityStatus availability, Double minRating) {
        List<User> users = role == null ? userRepository.findAll() : userRepository.findByRole(role);
        return users.stream()
                .filter(user -> matchesFreelancerFilters(user, specialty, availability, minRating))
                .map(this::mapToProfile)
                .toList();
    }

    private boolean matchesFreelancerFilters(
            User user,
            String specialty,
            AvailabilityStatus availability,
            Double minRating
    ) {
        if (user.getRole() != Role.FREELANCER) {
            return true;
        }
        if (specialty != null && !specialty.isBlank()
                && (user.getSpecialty() == null
                || !user.getSpecialty().toLowerCase().contains(specialty.toLowerCase()))) {
            return false;
        }
        if (availability != null && user.getAvailability() != availability) {
            return false;
        }
        if (minRating != null && feedbackRepository.averageRatingByFreelancer(user) < minRating) {
            return false;
        }
        return true;
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new ApiException("Email is already registered");
        }

        user.setName(request.name());
        user.setEmail(request.email());

        if (user.getRole() == Role.FREELANCER) {
            user.setSpecialty(request.specialty());
            user.setYearsOfExperience(request.yearsOfExperience());
            user.setDailyRate(request.dailyRate());
            user.setAvailability(request.availability());
            user.setSkills(request.skills());
            user.setCvUrl(request.cvUrl());
        }

        return mapToProfile(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse uploadCv(MultipartFile file, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (user.getRole() != Role.FREELANCER) {
            throw new ApiException("Only freelancers can upload a CV");
        }

        String storedName = fileStorageService.storeCv(user.getId(), file);
        user.setCvUrl("/api/files/cv/" + storedName);
        user.setCvUploadedAt(java.time.Instant.now());
        return mapToProfile(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new ApiException("Admin accounts cannot be deactivated");
        }

        user.setEnabled(enabled);
        return mapToProfile(userRepository.save(user));
    }

    private UserProfileResponse mapToProfile(User user) {
        Double averageRating = user.getRole() == Role.FREELANCER
                ? feedbackRepository.averageRatingByFreelancer(user)
                : null;
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getSpecialty(),
                user.getYearsOfExperience(),
                user.getDailyRate(),
                user.getAvailability(),
                user.getSkills(),
                user.getCvUrl(),
                user.getCvUploadedAt(),
                averageRating
        );
    }
}
