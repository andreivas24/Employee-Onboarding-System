package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.*;
import com.company.employee_onboarding_system.entity.OnboardingHistory;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.service.OnboardingService;
import com.company.employee_onboarding_system.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping
    public OnboardingRequest createRequest(
        @RequestHeader("X-User-Role") Role role,
        @Valid @RequestBody CreateOnboardingRequestDto dto
    ) {
        return onboardingService.createRequest(role, dto);
    }

    @GetMapping
    public List<OnboardingRequest> getAllRequests() {
        return onboardingService.getAllRequests();
    }

    @GetMapping("/{id}")
    public OnboardingRequest getRequestById(@PathVariable Long id) {
        return onboardingService.getRequestById(id);
    }

    @PutMapping("/{id}")
    public OnboardingRequest updateRequest(
        @RequestHeader("X-User-Role") Role role,
        @PathVariable Long id,
        @Valid @RequestBody UpdateOnboardingRequestDto dto
    ) {
        return onboardingService.updateRequest(role, id, dto);
    }

    @PostMapping("/{id}/resubmit")
    public OnboardingRequest resubmitRequest(
        @RequestHeader("X-User-Role") Role role,
        @PathVariable Long id
    ) {
        return onboardingService.resubmitRequest(role, id);
    }

    @PostMapping("/{id}/approve")
    public OnboardingRequest approveRequest(
        @RequestHeader("X-User-Role") Role role,
        @PathVariable Long id,
        @RequestBody(required = false) ITProvisioningDto itProvisioningDto
    ) {
        return onboardingService.approveRequest(role, id, itProvisioningDto);
    }

    @PostMapping("/{id}/reject")
    public OnboardingRequest rejectRequest(
        @RequestHeader("X-User-Role") Role role,
        @PathVariable Long id,
        @Valid @RequestBody RejectRequestDto dto
    ) {
        return onboardingService.rejectRequest(role, id, dto);
    }

    @PostMapping("/{id}/finance-approve")
    public OnboardingRequest financeApproveRequest(
        @RequestHeader("X-User-Role") Role role,
        @PathVariable Long id,
        @Valid @RequestBody FinanceApprovalDto dto
    ) {
        return onboardingService.financeApproveRequest(role, id, dto);
    }

    @GetMapping("/{id}/history")
    public List<OnboardingHistory> getRequestHistory(@PathVariable Long id) {
        return onboardingService.getHistoryByRequestId(id);
    }

    @GetMapping("/stats")
    public DashboardStatsDto getDashboardStats() {
        return onboardingService.getDashboardStats();
    }
}