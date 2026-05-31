package com.marketplace.repository;

import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByClient(User client);

    Page<OrderEntity> findByClient(User client, Pageable pageable);

    List<OrderEntity> findByAssignedFreelancer(User freelancer);

    Page<OrderEntity> findByAssignedFreelancer(User freelancer, Pageable pageable);
    Optional<OrderEntity> findByClientAndDescription(User client, String description);

    @Query("""
            SELECT o FROM OrderEntity o
            JOIN FETCH o.client
            LEFT JOIN FETCH o.service
            LEFT JOIN FETCH o.assignedFreelancer
            WHERE o.id = :id
            """)
    Optional<OrderEntity> findByIdWithDetails(@Param("id") Long id);

    long countByStatus(OrderStatus status);

    long countByStatusIn(List<OrderStatus> statuses);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt >= :since")
    long countCreatedSince(@Param("since") Instant since);
}
