package com.marketplace.config;

import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeederConfig {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin.name}")
    private String adminName;

    @Value("${app.seed.admin.email}")
    private String adminEmail;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner seedAdmin() {
        return args -> {
            if (!userRepository.existsByEmail(adminEmail)) {
                userRepository.save(User.builder()
                        .name(adminName)
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .build());
            }
        };
    }
}
