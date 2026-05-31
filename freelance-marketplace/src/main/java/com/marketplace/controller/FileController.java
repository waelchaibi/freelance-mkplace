package com.marketplace.controller;

import com.marketplace.entity.User;
import com.marketplace.service.CurrentUserService;
import com.marketplace.service.FileStorageService;
import com.marketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final CurrentUserService currentUserService;
    private final UserService userService;

    @GetMapping("/cv/{storedName}")
    public ResponseEntity<Resource> downloadCv(@PathVariable String storedName, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        Resource resource = fileStorageService.loadCv(storedName);
        return fileResponse(resource, storedName, MediaType.APPLICATION_PDF);
    }

    @GetMapping("/cv/user/{userId}")
    public ResponseEntity<Resource> downloadCvByUser(@PathVariable Long userId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        User profile = userService.getUserEntity(userId);
        if (profile.getCvUrl() == null || !profile.getCvUrl().startsWith("/api/files/cv/")) {
            return ResponseEntity.notFound().build();
        }
        String storedName = profile.getCvUrl().substring("/api/files/cv/".length());
        Resource resource = fileStorageService.loadCv(storedName);
        return fileResponse(resource, "cv-" + userId + ".pdf", MediaType.APPLICATION_PDF);
    }

    @GetMapping("/portfolio/image/{storedName}")
    public ResponseEntity<Resource> downloadPortfolioImage(@PathVariable String storedName, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        Resource resource = fileStorageService.loadPortfolioImage(storedName);
        return fileResponse(resource, storedName, fileStorageService.resolveMediaType(storedName));
    }

    @GetMapping("/portfolio/attachment/{storedName}")
    public ResponseEntity<Resource> downloadPortfolioAttachment(@PathVariable String storedName, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        Resource resource = fileStorageService.loadPortfolioAttachment(storedName);
        MediaType type = fileStorageService.resolveMediaType(storedName);
        boolean inline = type.getType().startsWith("image") || MediaType.APPLICATION_PDF.equals(type);
        return fileResponse(resource, storedName, type, inline);
    }

    private ResponseEntity<Resource> fileResponse(Resource resource, String filename, MediaType mediaType) {
        return fileResponse(resource, filename, mediaType, true);
    }

    private ResponseEntity<Resource> fileResponse(Resource resource, String filename, MediaType mediaType, boolean inline) {
        String disposition = (inline ? "inline" : "attachment") + "; filename=\"" + filename + "\"";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(mediaType)
                .body(resource);
    }
}
