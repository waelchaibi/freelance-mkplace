package com.marketplace.service;

import com.marketplace.dto.user.UserProfileResponse;
import com.marketplace.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;

    public UserProfileResponse getMyProfile(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
