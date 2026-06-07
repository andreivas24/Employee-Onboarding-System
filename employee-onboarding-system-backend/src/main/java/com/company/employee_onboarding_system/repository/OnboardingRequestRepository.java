package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequest, Long> {

    List<OnboardingRequest> findByStatus(OnboardingStatus status);
}