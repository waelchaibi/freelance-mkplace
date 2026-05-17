package com.marketplace.repository;

import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByOrderOrderByCreatedAtAsc(OrderEntity order);

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            JOIN FETCH m.receiver
            JOIN FETCH m.order
            WHERE m.order = :order
            ORDER BY m.createdAt ASC
            """)
    List<Message> findByOrderWithUsers(@Param("order") OrderEntity order);

    boolean existsByOrderAndSenderAndContent(OrderEntity order, User sender, String content);
}
