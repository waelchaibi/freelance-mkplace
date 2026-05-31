package com.marketplace.repository;

import com.marketplace.entity.Feedback;
import com.marketplace.entity.OrderEntity;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByOrder(OrderEntity order);

    List<Feedback> findByFreelancerOrderByCreatedAtDesc(User freelancer);

    boolean existsByOrder(OrderEntity order);

    List<Feedback> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(AVG(f.rating), 0) FROM Feedback f")
    double averageRating();

    @Query("SELECT COALESCE(AVG(f.rating), 0) FROM Feedback f WHERE f.freelancer = :freelancer")
    double averageRatingByFreelancer(@Param("freelancer") User freelancer);
}
