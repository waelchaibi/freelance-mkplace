package com.marketplace.controller;

import com.marketplace.dto.message.MessageResponse;
import com.marketplace.dto.message.SendMessageRequest;
import com.marketplace.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT','FREELANCER')")
    public List<MessageResponse> getOrderMessages(@PathVariable Long orderId, Authentication authentication) {
        return messageService.getByOrder(orderId, authentication);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT','FREELANCER')")
    public MessageResponse send(@Valid @RequestBody SendMessageRequest request, Authentication authentication) {
        return messageService.send(request, authentication);
    }
}
