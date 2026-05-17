package com.marketplace.service;

import com.marketplace.dto.user.UserProfileResponse;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public UserProfileResponse getMyProfile(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return mapToProfile(user);
    }

    public UserProfileResponse getAdminContact() {
        User admin = userRepository.findFirstByRole(Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        return mapToProfile(admin);
    }

    public List<UserProfileResponse> listUsers(Role role) {
        List<User> users = role == null ? userRepository.findAll() : userRepository.findByRole(role);
        return users.stream().map(this::mapToProfile).toList();
    }

    private UserProfileResponse mapToProfile(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
