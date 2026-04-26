package com.marketplace.service;

import com.marketplace.dto.message.MessageResponse;
import com.marketplace.dto.message.SendMessageRequest;
import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<MessageResponse> getByOrder(Long orderId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderService.getById(orderId);
        ensureUserCanAccessOrderConversation(actor, order);
        return messageRepository.findByOrderOrderByCreatedAtAsc(order).stream().map(this::mapToResponse).toList();
    }

    public MessageResponse send(SendMessageRequest request, Authentication authentication) {
        User sender = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderService.getById(request.orderId());
        User receiver = userRepository.findById(request.receiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new ApiException("Sender and receiver cannot be the same");
        }

        ensureUserCanAccessOrderConversation(sender, order);
        ensureUserCanAccessOrderConversation(receiver, order);
        ensureAdminIntermediaryRule(sender, receiver);

        Message message = Message.builder()
                .order(order)
                .sender(sender)
                .receiver(receiver)
                .content(request.content())
                .build();

        MessageResponse response = mapToResponse(messageRepository.save(message));
        messagingTemplate.convertAndSend("/topic/orders/" + order.getId(), response);
        return response;
    }

    private void ensureUserCanAccessOrderConversation(User user, OrderEntity order) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (user.getRole() == Role.CLIENT) {
            if (!order.getClient().getId().equals(user.getId())) {
                throw new ApiException("Client can only access their own order messages");
            }
            return;
        }

        if (user.getRole() == Role.FREELANCER) {
            if (order.getAssignedFreelancer() == null || !order.getAssignedFreelancer().getId().equals(user.getId())) {
                throw new ApiException("Only assigned freelancer can interact on this order");
            }
            return;
        }

        throw new ApiException("Unsupported role for messaging");
    }

    private void ensureAdminIntermediaryRule(User sender, User receiver) {
        boolean senderAdmin = sender.getRole() == Role.ADMIN;
        boolean receiverAdmin = receiver.getRole() == Role.ADMIN;

        if (!senderAdmin && !receiverAdmin) {
            throw new ApiException("Direct client-freelancer communication is forbidden");
        }

        if ((sender.getRole() == Role.CLIENT && receiver.getRole() == Role.FREELANCER)
                || (sender.getRole() == Role.FREELANCER && receiver.getRole() == Role.CLIENT)) {
            throw new ApiException("Direct client-freelancer communication is forbidden");
        }
    }

    private MessageResponse mapToResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getOrder().getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getReceiver().getId(),
                message.getReceiver().getName(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
