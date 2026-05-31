package com.marketplace.repository;

import com.marketplace.entity.PortfolioItem;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByFreelancerOrderByCreatedAtDesc(User freelancer);
}
