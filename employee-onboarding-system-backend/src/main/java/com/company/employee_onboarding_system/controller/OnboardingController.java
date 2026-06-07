package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.CreateOnboardingRequestDto;
import com.company.employee_onboarding_system.dto.ITProvisioningDto;
import com.company.employee_onboarding_system.dto.RejectRequestDto;
import com.company.employee_onboarding_system.dto.UpdateOnboardingRequestDto;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.service.OnboardingService;
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
    public OnboardingRequest createRequest(@Valid @RequestBody CreateOnboardingRequestDto dto) {
        return onboardingService.createRequest(dto);
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
            @PathVariable Long id,
            @Valid @RequestBody UpdateOnboardingRequestDto dto
    ) {
        return onboardingService.updateRequest(id, dto);
    }

    @PostMapping("/{id}/resubmit")
    public OnboardingRequest resubmitRequest(@PathVariable Long id) {
        return onboardingService.resubmitRequest(id);
    }

    @PostMapping("/{id}/approve")
    public OnboardingRequest approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ITProvisioningDto itProvisioningDto
    ) {
        return onboardingService.approveRequest(id, itProvisioningDto);
    }

    @PostMapping("/{id}/reject")
    public OnboardingRequest rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequestDto dto
    ) {
        return onboardingService.rejectRequest(id, dto);
    }
}