package com.marketplace.controller;

import com.marketplace.dto.user.ChangePasswordRequest;
import com.marketplace.dto.user.SetUserEnabledRequest;
import com.marketplace.dto.user.UpdateProfileRequest;
import com.marketplace.dto.user.UserProfileResponse;
import com.marketplace.entity.enums.AvailabilityStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(@Valid @RequestBody UpdateProfileRequest request,
                                               Authentication authentication) {
        return userService.updateMyProfile(request, authentication);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request,
                               Authentication authentication) {
        userService.changePassword(request, authentication);
    }

    @PostMapping(value = "/me/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserProfileResponse uploadCv(@RequestPart("file") MultipartFile file,
                                        Authentication authentication) {
        return userService.uploadCv(file, authentication);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT','FREELANCER')")
    public UserProfileResponse getAdminContact() {
        return userService.getAdminContact();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> listUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) AvailabilityStatus availability,
            @RequestParam(required = false) Double minRating
    ) {
        return userService.listUsers(role, specialty, availability, minRating);
    }

    @PutMapping("/{id}/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileResponse setUserEnabled(@PathVariable Long id,
                                              @Valid @RequestBody SetUserEnabledRequest request) {
        return userService.setUserEnabled(id, request.enabled());
    }
}
