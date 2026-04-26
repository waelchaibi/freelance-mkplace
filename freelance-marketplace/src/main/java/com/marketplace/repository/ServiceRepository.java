package com.marketplace.repository;

import com.marketplace.entity.ServiceEntity;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByStatus(ServiceStatus status);
    List<ServiceEntity> findByFreelancer(User freelancer);
}
