package com.marketplace.config;

import com.marketplace.entity.Feedback;
import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.PortfolioItem;
import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.AvailabilityStatus;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.ServiceStatus;
import com.marketplace.repository.FeedbackRepository;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.PortfolioRepository;
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
import java.time.Instant;
import java.time.LocalDate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseSeederConfig {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final OrderRepository orderRepository;
    private final MessageRepository messageRepository;
    private final PortfolioRepository portfolioRepository;
    private final FeedbackRepository feedbackRepository;
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

        User freelancerSara = ensureFreelancer(
                "Sara Freelancer",
                "sara@marketplace.com",
                "Freelancer123!",
                "Graphic Design",
                5,
                new BigDecimal("350.00"),
                AvailabilityStatus.AVAILABLE,
                "Logo design, Brand identity, Adobe Illustrator"
        );
        User freelancerOmar = ensureFreelancer(
                "Omar Freelancer",
                "omar@marketplace.com",
                "Freelancer123!",
                "Full Stack Development",
                7,
                new BigDecimal("450.00"),
                AvailabilityStatus.BUSY,
                "Java, Spring Boot, Angular, PostgreSQL"
        );

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
                "Coffee Shop Logo",
                "Adobe Illustrator",
                "Need a minimalist logo for my coffee shop.",
                OrderStatus.PENDING,
                null,
                LocalDate.now().plusWeeks(2)
        );

        OrderEntity assignedOrder = ensureOrder(
                clientBob,
                webApp,
                "Marketplace MVP",
                "Angular, Spring Boot",
                "Marketplace MVP with auth and role-based dashboards.",
                OrderStatus.ASSIGNED,
                freelancerOmar,
                LocalDate.now().plusMonths(2)
        );

        ensureMessage(assignedOrder, clientBob, admin, "Hi admin, I placed an order for the web app project.");
        ensureMessage(assignedOrder, admin, clientBob, "Thanks Bob. I will assign Omar and keep you updated.");
        ensureMessage(assignedOrder, admin, freelancerOmar, "Omar, you are assigned to Bob's marketplace MVP order.");

        ensurePortfolioItem(
                freelancerSara,
                "Coffee Shop Rebrand",
                "Complete visual identity for a local coffee shop including logo and packaging.",
                "Adobe Illustrator, Branding",
                "https://example.com/portfolio/coffee-shop",
                "https://picsum.photos/seed/coffee/640/360"
        );
        ensurePortfolioItem(
                freelancerOmar,
                "E-commerce Dashboard",
                "Admin dashboard with sales analytics and inventory management.",
                "Angular, Spring Boot, PostgreSQL",
                "https://example.com/portfolio/ecommerce",
                "https://picsum.photos/seed/ecommerce/640/360"
        );

        OrderEntity doneOrder = ensureOrder(
                clientAlice,
                logoDesign,
                "Bakery Logo Project",
                "Adobe Illustrator",
                "Completed logo project for bakery brand.",
                OrderStatus.DONE,
                freelancerSara,
                LocalDate.now().minusWeeks(1)
        );
        ensureFeedback(doneOrder, clientAlice, freelancerSara, 5, 5, 5, 5,
                "Excellent work, very responsive and creative.");

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
                    .enabled(true)
                    .build());
            log.info("Seeded user: {} ({})", email, role);
            return user;
        });
    }

    private User ensureFreelancer(
            String name,
            String email,
            String rawPassword,
            String specialty,
            int yearsOfExperience,
            BigDecimal dailyRate,
            AvailabilityStatus availability,
            String skills
    ) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = userRepository.save(User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(Role.FREELANCER)
                    .enabled(true)
                    .specialty(specialty)
                    .yearsOfExperience(yearsOfExperience)
                    .dailyRate(dailyRate)
                    .availability(availability)
                    .skills(skills)
                    .cvUrl("https://example.com/cv/" + email.split("@")[0] + ".pdf")
                    .build());
            log.info("Seeded freelancer: {} ({})", email, specialty);
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
            String title,
            String technology,
            String description,
            OrderStatus status,
            User assignedFreelancer,
            LocalDate deadline
    ) {
        return orderRepository.findByClientAndDescription(client, description).orElseGet(() -> {
            Instant now = Instant.now();
            OrderEntity.OrderEntityBuilder builder = OrderEntity.builder()
                    .client(client)
                    .service(service)
                    .title(title)
                    .technology(technology)
                    .description(description)
                    .status(status)
                    .assignedFreelancer(assignedFreelancer)
                    .deadline(deadline)
                    .createdAt(now);

            if (status == OrderStatus.ASSIGNED || status == OrderStatus.IN_PROGRESS || status == OrderStatus.DONE) {
                builder.assignedAt(now);
            }
            if (status == OrderStatus.IN_PROGRESS || status == OrderStatus.DONE) {
                builder.inProgressAt(now).progressPercent(status == OrderStatus.DONE ? 100 : 40);
            }
            if (status == OrderStatus.DONE) {
                builder.doneAt(now);
            }

            OrderEntity order = orderRepository.save(builder.build());
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

    private void ensurePortfolioItem(
            User freelancer,
            String title,
            String description,
            String technologies,
            String projectUrl,
            String imageUrl
    ) {
        if (portfolioRepository.findByFreelancerOrderByCreatedAtDesc(freelancer).stream()
                .anyMatch(item -> item.getTitle().equals(title))) {
            return;
        }
        portfolioRepository.save(PortfolioItem.builder()
                .freelancer(freelancer)
                .title(title)
                .description(description)
                .technologies(technologies)
                .projectUrl(projectUrl)
                .imageUrl(imageUrl)
                .build());
        log.info("Seeded portfolio item: {} ({})", title, freelancer.getEmail());
    }

    private void ensureFeedback(
            OrderEntity order,
            User client,
            User freelancer,
            int rating,
            int qualityScore,
            int communicationScore,
            int timelinessScore,
            String comment
    ) {
        if (feedbackRepository.existsByOrder(order)) {
            return;
        }
        feedbackRepository.save(Feedback.builder()
                .order(order)
                .client(client)
                .freelancer(freelancer)
                .rating(rating)
                .qualityScore(qualityScore)
                .communicationScore(communicationScore)
                .timelinessScore(timelinessScore)
                .comment(comment)
                .adminCreated(false)
                .build());
        log.info("Seeded feedback on order #{}", order.getId());
    }
}
