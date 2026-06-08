package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.Notification;
import com.company.employee_onboarding_system.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRoleOrderByCreatedAtDesc(Role targetRole);

    long countByTargetRoleAndReadFalse(Role targetRole);
}