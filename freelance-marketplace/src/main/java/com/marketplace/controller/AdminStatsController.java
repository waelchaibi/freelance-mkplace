package com.marketplace.controller;

import com.marketplace.dto.admin.AdminStatsResponse;
import com.marketplace.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsResponse getStats(Authentication authentication) {
        return adminStatsService.getStats(authentication);
    }
}
