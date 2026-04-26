package com.marketplace.repository;

import com.marketplace.entity.Message;
import com.marketplace.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByOrderOrderByCreatedAtAsc(OrderEntity order);
}
