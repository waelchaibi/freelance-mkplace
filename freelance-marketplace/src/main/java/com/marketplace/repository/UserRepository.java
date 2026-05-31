package com.marketplace.repository;

import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findFirstByRole(Role role);
    List<User> findByRole(Role role);

    long countByRole(Role role);
}
