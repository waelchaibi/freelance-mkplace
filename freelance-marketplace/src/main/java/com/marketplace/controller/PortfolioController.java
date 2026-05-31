package com.marketplace.controller;

import com.marketplace.dto.common.UploadResponse;
import com.marketplace.dto.portfolio.CreatePortfolioItemRequest;
import com.marketplace.dto.portfolio.PortfolioItemResponse;
import com.marketplace.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/me")
    public List<PortfolioItemResponse> getMyPortfolio(Authentication authentication) {
        return portfolioService.getMyPortfolio(authentication);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public List<PortfolioItemResponse> getByFreelancer(@PathVariable Long freelancerId) {
        return portfolioService.getByFreelancer(freelancerId);
    }

    @PostMapping(value = "/me/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse uploadImage(@RequestPart("file") MultipartFile file, Authentication authentication) {
        return portfolioService.uploadImage(file, authentication);
    }

    @PostMapping(value = "/me/upload/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse uploadAttachment(@RequestPart("file") MultipartFile file, Authentication authentication) {
        return portfolioService.uploadAttachment(file, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioItemResponse create(@Valid @RequestBody CreatePortfolioItemRequest request,
                                        Authentication authentication) {
        return portfolioService.create(request, authentication);
    }

    @PutMapping("/{id}")
    public PortfolioItemResponse update(@PathVariable Long id,
                                        @Valid @RequestBody CreatePortfolioItemRequest request,
                                        Authentication authentication) {
        return portfolioService.update(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        portfolioService.delete(id, authentication);
    }
}
