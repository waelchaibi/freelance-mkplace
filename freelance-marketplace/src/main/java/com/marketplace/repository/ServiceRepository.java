package com.marketplace.repository;

import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByStatus(ServiceStatus status);
    List<ServiceEntity> findByFreelancer(User freelancer);
    Optional<ServiceEntity> findByFreelancerAndTitle(User freelancer, String title);
}
