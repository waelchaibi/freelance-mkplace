package com.marketplace.config;

import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ServiceRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseSeederConfig {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final OrderRepository orderRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin.name}")
    private String adminName;

    @Value("${app.seed.admin.email}")
    private String adminEmail;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Bean
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
    public CommandLineRunner seedDatabase() {
        return args -> seed();
    }

    @Transactional
    protected void seed() {
        User admin = ensureUser(adminName, adminEmail, adminPassword, Role.ADMIN);

        User clientAlice = ensureUser("Alice Client", "alice@marketplace.com", "Client123!", Role.CLIENT);
        User clientBob = ensureUser("Bob Client", "bob@marketplace.com", "Client123!", Role.CLIENT);

        User freelancerSara = ensureUser("Sara Freelancer", "sara@marketplace.com", "Freelancer123!", Role.FREELANCER);
        User freelancerOmar = ensureUser("Omar Freelancer", "omar@marketplace.com", "Freelancer123!", Role.FREELANCER);

        ServiceEntity logoDesign = ensureService(
                freelancerSara,
                "Logo Design",
                "Professional logo design with 2 revision rounds.",
                new BigDecimal("150.00"),
                ServiceStatus.APPROVED
        );
        ensureService(
                freelancerSara,
                "Brand Identity Kit",
                "Full brand kit: logo, colors, and typography guide.",
                new BigDecimal("400.00"),
                ServiceStatus.PENDING
        );
        ServiceEntity webApp = ensureService(
                freelancerOmar,
                "Full Stack Web App",
                "End-to-end web application with REST API and admin dashboard.",
                new BigDecimal("1200.00"),
                ServiceStatus.APPROVED
        );
        ensureService(
                freelancerOmar,
                "API Integration",
                "Third-party API integration and documentation.",
                new BigDecimal("350.00"),
                ServiceStatus.APPROVED
        );

        OrderEntity pendingOrder = ensureOrder(
                clientAlice,
                logoDesign,
                "Need a minimalist logo for my coffee shop.",
                OrderStatus.PENDING,
                null
        );

        OrderEntity assignedOrder = ensureOrder(
                clientBob,
                webApp,
                "Marketplace MVP with auth and role-based dashboards.",
                OrderStatus.ASSIGNED,
                freelancerOmar
        );

        ensureMessage(assignedOrder, clientBob, admin, "Hi admin, I placed an order for the web app project.");
        ensureMessage(assignedOrder, admin, clientBob, "Thanks Bob. I will assign Omar and keep you updated.");
        ensureMessage(assignedOrder, admin, freelancerOmar, "Omar, you are assigned to Bob's marketplace MVP order.");

        log.info("Database seed ready — demo accounts:");
        log.info("  Admin:      {} / {}", adminEmail, adminPassword);
        log.info("  Client:     alice@marketplace.com / Client123!");
        log.info("  Client:     bob@marketplace.com / Client123!");
        log.info("  Freelancer: sara@marketplace.com / Freelancer123!");
        log.info("  Freelancer: omar@marketplace.com / Freelancer123!");
        log.info("  Sample orders: #{} (PENDING), #{} (ASSIGNED)", pendingOrder.getId(), assignedOrder.getId());
    }

    private User ensureUser(String name, String email, String rawPassword, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = userRepository.save(User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .build());
            log.info("Seeded user: {} ({})", email, role);
            return user;
        });
    }

    private ServiceEntity ensureService(
            User freelancer,
            String title,
            String description,
            BigDecimal price,
            ServiceStatus status
    ) {
        return serviceRepository.findByFreelancerAndTitle(freelancer, title).orElseGet(() -> {
            ServiceEntity service = serviceRepository.save(ServiceEntity.builder()
                    .freelancer(freelancer)
                    .title(title)
                    .description(description)
                    .price(price)
                    .status(status)
                    .build());
            log.info("Seeded service: {} [{}]", title, status);
            return service;
        });
    }

    private OrderEntity ensureOrder(
            User client,
            ServiceEntity service,
            String description,
            OrderStatus status,
            User assignedFreelancer
    ) {
        return orderRepository.findByClientAndDescription(client, description).orElseGet(() -> {
            OrderEntity order = orderRepository.save(OrderEntity.builder()
                    .client(client)
                    .service(service)
                    .description(description)
                    .status(status)
                    .assignedFreelancer(assignedFreelancer)
                    .build());
            log.info("Seeded order: {} ({})", description, status);
            return order;
        });
    }

    private void ensureMessage(OrderEntity order, User sender, User receiver, String content) {
        if (messageRepository.existsByOrderAndSenderAndContent(order, sender, content)) {
            return;
        }
        messageRepository.save(Message.builder()
                .order(order)
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .build());
        log.info("Seeded message on order #{}: {} -> {}", order.getId(), sender.getEmail(), receiver.getEmail());
    }
}
