package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.CreateCommentDto;
import com.company.employee_onboarding_system.entity.OnboardingComment;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.service.OnboardingCommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding/{requestId}/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingCommentController {

    private final OnboardingCommentService onboardingCommentService;

    @GetMapping
    public List<OnboardingComment> getComments(
            @PathVariable Long requestId
    ) {
        return onboardingCommentService.getComments(requestId);
    }

    @PostMapping
    public OnboardingComment addComment(
        HttpServletRequest request,
        @PathVariable Long requestId,
        @Valid @RequestBody CreateCommentDto dto
    ) {
        String authorEmail =
            (String) request.getAttribute("userEmail");

        Role authorRole =
            Role.valueOf(
                (String) request.getAttribute("userRole")
            );

        return onboardingCommentService.addComment(
            requestId,
            authorEmail,
            authorRole,
            dto
        );
    }
}