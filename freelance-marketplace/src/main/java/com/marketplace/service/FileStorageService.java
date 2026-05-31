package com.marketplace.service;

import com.marketplace.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CV_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final Set<String> ALLOWED_PORTFOLIO_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_PORTFOLIO_ATTACHMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
            "application/x-zip-compressed",
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.ofEntries(
            Map.entry("application/pdf", ".pdf"),
            Map.entry("application/msword", ".doc"),
            Map.entry("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"),
            Map.entry("application/zip", ".zip"),
            Map.entry("application/x-zip-compressed", ".zip"),
            Map.entry("text/plain", ".txt"),
            Map.entry("image/jpeg", ".jpg"),
            Map.entry("image/png", ".png"),
            Map.entry("image/webp", ".webp"),
            Map.entry("image/gif", ".gif")
    );

    private final Path cvUploadDir;
    private final Path portfolioImageDir;
    private final Path portfolioAttachmentDir;

    public FileStorageService(
            @Value("${app.upload.cv-dir:uploads/cv}") String cvDir,
            @Value("${app.upload.portfolio-image-dir:uploads/portfolio/images}") String portfolioImageDir,
            @Value("${app.upload.portfolio-attachment-dir:uploads/portfolio/attachments}") String portfolioAttachmentDir
    ) {
        this.cvUploadDir = initDir(cvDir);
        this.portfolioImageDir = initDir(portfolioImageDir);
        this.portfolioAttachmentDir = initDir(portfolioAttachmentDir);
    }

    public String storeCv(Long userId, MultipartFile file) {
        return storeFile(userId, file, cvUploadDir, ALLOWED_CV_TYPES, 5 * 1024 * 1024, "CV");
    }

    public String storePortfolioImage(Long userId, MultipartFile file) {
        return storeFile(userId, file, portfolioImageDir, ALLOWED_PORTFOLIO_IMAGE_TYPES, 10 * 1024 * 1024, "Portfolio image");
    }

    public String storePortfolioAttachment(Long userId, MultipartFile file) {
        return storeFile(userId, file, portfolioAttachmentDir, ALLOWED_PORTFOLIO_ATTACHMENT_TYPES, 10 * 1024 * 1024, "Portfolio file");
    }

    public Resource loadCv(String storedName) {
        return loadFile(cvUploadDir, storedName, "CV");
    }

    public Resource loadPortfolioImage(String storedName) {
        return loadFile(portfolioImageDir, storedName, "Portfolio image");
    }

    public Resource loadPortfolioAttachment(String storedName) {
        return loadFile(portfolioAttachmentDir, storedName, "Portfolio file");
    }

    public MediaType resolveMediaType(String storedName) {
        String lower = storedName.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        if (lower.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }
        if (lower.endsWith(".zip")) {
            return MediaType.parseMediaType("application/zip");
        }
        if (lower.endsWith(".txt")) {
            return MediaType.TEXT_PLAIN;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private Path initDir(String dir) {
        Path path = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(path);
        } catch (IOException ex) {
            throw new ApiException("Could not initialize upload directory: " + dir);
        }
        return path;
    }

    private String storeFile(
            Long userId,
            MultipartFile file,
            Path uploadDir,
            Set<String> allowedTypes,
            long maxBytes,
            String label
    ) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(label + " file is required");
        }
        if (file.getSize() > maxBytes) {
            throw new ApiException(label + " must be " + (maxBytes / (1024 * 1024)) + " MB or smaller");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new ApiException("Unsupported " + label.toLowerCase() + " file type");
        }

        String extension = EXTENSION_BY_CONTENT_TYPE.getOrDefault(contentType, "");
        String storedName = userId + "-" + UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(storedName).normalize();

        if (!target.startsWith(uploadDir)) {
            throw new ApiException("Invalid file path");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException("Failed to store " + label.toLowerCase());
        }

        return storedName;
    }

    private Resource loadFile(Path uploadDir, String storedName, String label) {
        try {
            Path file = uploadDir.resolve(storedName).normalize();
            if (!file.startsWith(uploadDir) || !Files.exists(file)) {
                throw new ApiException(label + " not found");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ApiException(label + " not found");
            }
            return resource;
        } catch (IOException ex) {
            throw new ApiException(label + " not found");
        }
    }
}
