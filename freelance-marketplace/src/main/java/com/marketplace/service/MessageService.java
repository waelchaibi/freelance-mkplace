package com.marketplace.service;

import com.marketplace.dto.message.ConversationSummaryResponse;
import com.marketplace.dto.message.MessageResponse;
import com.marketplace.dto.message.SendMessageRequest;
import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.NotificationType;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.ApiException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getInbox(Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        List<OrderEntity> orders = resolveAccessibleOrders(actor);

        return orders.stream()
                .map(order -> buildConversationSummary(order, actor))
                .sorted(Comparator
                        .comparing(ConversationSummaryResponse::lastMessageAt,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ConversationSummaryResponse::orderId, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getByOrder(Long orderId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderService.getById(orderId);
        ensureUserCanAccessOrderConversation(actor, order);

        markMessagesAsRead(order, actor);

        List<Message> messages = actor.getRole() == Role.ADMIN
                ? messageRepository.findByOrderWithUsers(order)
                : messageRepository.findByOrderVisibleToUser(order, actor.getId());

        return messages.stream().map(this::mapToResponse).toList();
    }

    public void markOrderMessagesAsRead(Long orderId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        OrderEntity order = orderService.getById(orderId);
        ensureUserCanAccessOrderConversation(actor, order);
        markMessagesAsRead(order, actor);
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
        publishMessage(order, response, sender, receiver);

        notificationService.notifyUser(
                receiver,
                NotificationType.MESSAGE_RECEIVED,
                "New message on order #" + order.getId(),
                sender.getName() + ": " + truncate(request.content(), 120),
                order.getId()
        );

        return response;
    }

    private void markMessagesAsRead(OrderEntity order, User reader) {
        List<Message> unread = messageRepository.findByOrderAndReceiverAndReadAtIsNull(order, reader);
        if (unread.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        unread.forEach(message -> message.setReadAt(now));
    }

    private void publishMessage(OrderEntity order, MessageResponse response, User sender, User receiver) {
        String baseTopic = "/topic/orders/" + order.getId();
        messagingTemplate.convertAndSend(baseTopic + "/participant/" + receiver.getId(), response);
        messagingTemplate.convertAndSend(baseTopic + "/participant/" + sender.getId(), response);
        messagingTemplate.convertAndSend(baseTopic + "/admin", response);
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
                message.getCreatedAt(),
                message.getReadAt()
        );
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }

    private List<OrderEntity> resolveAccessibleOrders(User actor) {
        return switch (actor.getRole()) {
            case ADMIN -> orderRepository.findAll();
            case CLIENT -> orderRepository.findByClient(actor);
            case FREELANCER -> orderRepository.findByAssignedFreelancer(actor);
        };
    }

    private ConversationSummaryResponse buildConversationSummary(OrderEntity order, User actor) {
        List<Message> messages = actor.getRole() == Role.ADMIN
                ? messageRepository.findByOrderWithUsers(order)
                : messageRepository.findByOrderVisibleToUser(order, actor.getId());

        Message lastMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1);
        long unread = messageRepository.findByOrderAndReceiverAndReadAtIsNull(order, actor).size();

        String orderTitle = order.getService() != null ? order.getService().getTitle() : "Custom request";

        return new ConversationSummaryResponse(
                order.getId(),
                orderTitle,
                truncate(order.getDescription(), 80),
                order.getStatus(),
                resolveCounterpartName(order, actor),
                lastMessage == null ? null : truncate(lastMessage.getContent(), 120),
                lastMessage == null ? null : lastMessage.getCreatedAt(),
                unread
        );
    }

    private String resolveCounterpartName(OrderEntity order, User actor) {
        if (actor.getRole() == Role.ADMIN) {
            String freelancer = order.getAssignedFreelancer() != null
                    ? " / " + order.getAssignedFreelancer().getName()
                    : "";
            return order.getClient().getName() + freelancer;
        }
        return userRepository.findFirstByRole(Role.ADMIN)
                .map(User::getName)
                .orElse("Admin");
    }
}
