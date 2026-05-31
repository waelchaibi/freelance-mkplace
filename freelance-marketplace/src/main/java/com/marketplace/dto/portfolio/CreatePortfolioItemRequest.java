package com.marketplace.dto.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePortfolioItemRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 2000) String description,
        @Size(max = 500) String projectUrl,
        @Size(max = 500) String imageUrl,
        @Size(max = 500) String attachmentUrl,
        @Size(max = 500) String technologies
) {
}
