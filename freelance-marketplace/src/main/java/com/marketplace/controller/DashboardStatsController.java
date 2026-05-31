package com.marketplace.controller;

import com.marketplace.dto.dashboard.ClientStatsResponse;
import com.marketplace.dto.dashboard.FreelancerStatsResponse;
import com.marketplace.service.DashboardStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardStatsController {

    private final DashboardStatsService dashboardStatsService;

    @GetMapping("/client")
    @PreAuthorize("hasRole('CLIENT')")
    public ClientStatsResponse getClientStats(Authentication authentication) {
        return dashboardStatsService.getClientStats(authentication);
    }

    @GetMapping("/freelancer")
    @PreAuthorize("hasRole('FREELANCER')")
    public FreelancerStatsResponse getFreelancerStats(Authentication authentication) {
        return dashboardStatsService.getFreelancerStats(authentication);
    }
}
