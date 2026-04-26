package com.marketplace.dto.user;

import com.marketplace.entity.enums.Role;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}
