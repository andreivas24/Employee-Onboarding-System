package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.OnboardingComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnboardingCommentRepository extends JpaRepository<OnboardingComment, Long> {

    List<OnboardingComment> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}