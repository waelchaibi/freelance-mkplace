package com.marketplace.repository;

import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByClient(User client);
    List<OrderEntity> findByAssignedFreelancer(User freelancer);
}
