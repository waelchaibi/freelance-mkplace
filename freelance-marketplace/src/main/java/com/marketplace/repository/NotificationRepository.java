package com.marketplace.repository;

import com.marketplace.entity.Notification;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndReadFalse(User user);

    @Query("""
            SELECT n FROM Notification n
            JOIN FETCH n.user
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findAllWithUserOrderByCreatedAtDesc();
}
