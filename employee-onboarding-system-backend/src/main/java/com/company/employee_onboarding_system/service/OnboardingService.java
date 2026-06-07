package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.CreateOnboardingRequestDto;
import com.company.employee_onboarding_system.dto.ITProvisioningDto;
import com.company.employee_onboarding_system.dto.RejectRequestDto;
import com.company.employee_onboarding_system.dto.UpdateOnboardingRequestDto;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.HardwareTier;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingRequestRepository onboardingRequestRepository;

    public OnboardingRequest createRequest(CreateOnboardingRequestDto dto) {
        OnboardingRequest request = OnboardingRequest.builder()
                .employeeName(dto.getEmployeeName())
                .employeeRole(dto.getEmployeeRole())
                .startDate(dto.getStartDate())
                .hardwareTier(dto.getHardwareTier())
                .jobDescription(dto.getJobDescription())
                .status(OnboardingStatus.MANAGER_REVIEW)
                .build();

        return onboardingRequestRepository.save(request);
    }

    public List<OnboardingRequest> getAllRequests() {
        return onboardingRequestRepository.findAll();
    }

    public OnboardingRequest getRequestById(Long id) {
        return onboardingRequestRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Onboarding request not found with id: " + id
                        )
                );
    }

    public OnboardingRequest updateRequest(Long id, UpdateOnboardingRequestDto dto) {
        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.NEEDS_REWORK) {
            throw new BadRequestException("Only requests with NEEDS_REWORK status can be updated.");
        }

        request.setEmployeeName(dto.getEmployeeName());
        request.setEmployeeRole(dto.getEmployeeRole());
        request.setStartDate(dto.getStartDate());
        request.setHardwareTier(dto.getHardwareTier());
        request.setJobDescription(dto.getJobDescription());

        return onboardingRequestRepository.save(request);
    }

    public OnboardingRequest resubmitRequest(Long id) {
        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.NEEDS_REWORK) {
            throw new BadRequestException("Only requests with NEEDS_REWORK status can be resubmitted.");
        }

        request.setStatus(OnboardingStatus.MANAGER_REVIEW);
        request.setRejectionReason(null);

        return onboardingRequestRepository.save(request);
    }

    public OnboardingRequest approveRequest(Long id, ITProvisioningDto itProvisioningDto) {
        OnboardingRequest request = getRequestById(id);

        switch (request.getStatus()) {

            case MANAGER_REVIEW -> {
                if (request.getHardwareTier() == HardwareTier.PREMIUM) {
                    request.setStatus(OnboardingStatus.FINANCE_APPROVAL);
                } else {
                    request.setStatus(OnboardingStatus.IT_PROVISIONING);
                }
            }

            case FINANCE_APPROVAL -> request.setStatus(OnboardingStatus.IT_PROVISIONING);

            case IT_PROVISIONING -> {
                if (itProvisioningDto == null) {
                    throw new BadRequestException("IT provisioning details are required.");
                }

                request.setCompanyEmail(itProvisioningDto.getCompanyEmail());
                request.setLaptopConfiguration(itProvisioningDto.getLaptopConfiguration());
                request.setStatus(OnboardingStatus.COMPLETED);
            }

            default -> throw new BadRequestException(
                    "Request cannot be approved from status: " + request.getStatus()
            );
        }

        return onboardingRequestRepository.save(request);
    }

    public OnboardingRequest rejectRequest(Long id, RejectRequestDto dto) {
        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() == OnboardingStatus.COMPLETED) {
            throw new BadRequestException("Completed requests cannot be rejected.");
        }

        request.setStatus(OnboardingStatus.NEEDS_REWORK);
        request.setRejectionReason(dto.getRejectionReason());

        return onboardingRequestRepository.save(request);
    }
}