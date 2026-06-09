package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.CreateCommentDto;
import com.company.employee_onboarding_system.entity.OnboardingComment;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.OnboardingCommentRepository;
import com.company.employee_onboarding_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingCommentService {

    private final OnboardingCommentRepository onboardingCommentRepository;
    private final UserRepository userRepository;
    private final OnboardingService onboardingService;

    public List<OnboardingComment> getComments(Long requestId) {
        onboardingService.getRequestById(requestId);

        return onboardingCommentRepository.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    public OnboardingComment addComment(
        Long requestId,
        String authorEmail,
        Role authorRole,
        CreateCommentDto dto
    ) {
        onboardingService.getRequestById(requestId);

        User user = userRepository.findByEmail(authorEmail)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "User not found with email: " + authorEmail
                    )
            );

        OnboardingComment comment = OnboardingComment.builder()
            .requestId(requestId)
            .authorName(user.getFullName())
            .authorEmail(user.getEmail())
            .authorRole(authorRole)
            .commentText(dto.getCommentText())
            .build();

        return onboardingCommentRepository.save(comment);
    }
}