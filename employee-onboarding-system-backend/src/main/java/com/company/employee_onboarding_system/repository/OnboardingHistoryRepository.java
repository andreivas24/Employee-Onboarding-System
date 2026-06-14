package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.OnboardingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnboardingHistoryRepository extends JpaRepository<OnboardingHistory, Long> {

    List<OnboardingHistory> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    void deleteByRequestId(Long requestId);
}