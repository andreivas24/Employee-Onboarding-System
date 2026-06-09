package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.*;
import com.company.employee_onboarding_system.entity.OnboardingHistory;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.service.OnboardingService;
import com.company.employee_onboarding_system.enums.Role;
import jakarta.servlet.http.HttpServletRequest;
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
        HttpServletRequest request,
        @Valid @RequestBody CreateOnboardingRequestDto dto
    ) {
        Role role = getRoleFromToken(request);
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
        HttpServletRequest request,
        @PathVariable Long id,
        @Valid @RequestBody UpdateOnboardingRequestDto dto
    ) {
        Role role = getRoleFromToken(request);
        return onboardingService.updateRequest(role, id, dto);
    }

    @PostMapping("/{id}/resubmit")
    public OnboardingRequest resubmitRequest(
        HttpServletRequest request,
        @PathVariable Long id
    ) {
        Role role = getRoleFromToken(request);
        return onboardingService.resubmitRequest(role, id);
    }

    @PostMapping("/{id}/approve")
    public OnboardingRequest approveRequest(
        HttpServletRequest request,
        @PathVariable Long id,
        @RequestBody(required = false) ITProvisioningDto itProvisioningDto
    ) {
        Role role = getRoleFromToken(request);
        return onboardingService.approveRequest(role, id, itProvisioningDto);
    }

    @PostMapping("/{id}/reject")
    public OnboardingRequest rejectRequest(
        HttpServletRequest request,
        @PathVariable Long id,
        @Valid @RequestBody RejectRequestDto dto
    ) {
        Role role = getRoleFromToken(request);
        return onboardingService.rejectRequest(role, id, dto);
    }

    @PostMapping("/{id}/finance-approve")
    public OnboardingRequest financeApproveRequest(
        HttpServletRequest request,
        @PathVariable Long id,
        @Valid @RequestBody FinanceApprovalDto dto
    ) {
        Role role = getRoleFromToken(request);
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

    private Role getRoleFromToken(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        return Role.valueOf(role);
    }
}