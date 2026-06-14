package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.HardwareTier;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequest, Long> {

    long countByStatus(OnboardingStatus status);

    long countByHardwareTier(HardwareTier hardwareTier);

    List<OnboardingRequest> findByStatus(OnboardingStatus status);

    boolean existsByEmployeeNameIgnoreCaseAndEmployeeRoleIgnoreCaseAndStartDate(String employeeName, String employeeRole, LocalDate startDate);
}