package com.marketplace.controller;

import com.marketplace.dto.user.UserProfileResponse;
import com.marketplace.service.UserService;
import com.marketplace.entity.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(Authentication authentication) {
        return userService.getMyProfile(authentication);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT','FREELANCER')")
    public UserProfileResponse getAdminContact() {
        return userService.getAdminContact();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> listUsers(@RequestParam(required = false) Role role) {
        return userService.listUsers(role);
    }
}
