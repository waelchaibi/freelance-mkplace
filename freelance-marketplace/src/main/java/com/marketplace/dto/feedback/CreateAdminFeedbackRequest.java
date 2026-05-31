package com.marketplace.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAdminFeedbackRequest(
        @NotNull Long freelancerId,
        Long orderId,
        @Min(1) @Max(5) int rating,
        @Min(1) @Max(5) int qualityScore,
        @Min(1) @Max(5) int communicationScore,
        @Min(1) @Max(5) int timelinessScore,
        @NotBlank @Size(max = 2000) String comment
) {
}
