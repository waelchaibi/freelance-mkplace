package com.marketplace.controller;

import com.marketplace.dto.feedback.CreateAdminFeedbackRequest;
import com.marketplace.dto.feedback.CreateFeedbackRequest;
import com.marketplace.dto.feedback.FeedbackResponse;
import com.marketplace.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENT')")
    public FeedbackResponse create(@Valid @RequestBody CreateFeedbackRequest request,
                                   Authentication authentication) {
        return feedbackService.create(request, authentication);
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public FeedbackResponse createByAdmin(@Valid @RequestBody CreateAdminFeedbackRequest request,
                                        Authentication authentication) {
        return feedbackService.createByAdmin(request, authentication);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public List<FeedbackResponse> getMyFeedbacks(Authentication authentication) {
        return feedbackService.getMyFeedbacks(authentication);
    }

    @GetMapping("/order/{orderId}")
    public FeedbackResponse getByOrder(@PathVariable Long orderId, Authentication authentication) {
        return feedbackService.getByOrder(orderId, authentication);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public List<FeedbackResponse> getByFreelancer(@PathVariable Long freelancerId) {
        return feedbackService.getByFreelancer(freelancerId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<FeedbackResponse> getAll() {
        return feedbackService.getAll();
    }
}
