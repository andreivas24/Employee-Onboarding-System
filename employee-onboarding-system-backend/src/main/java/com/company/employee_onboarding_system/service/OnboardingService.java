package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.*;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.HardwareTier;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingRequestRepository onboardingRequestRepository;

    public OnboardingRequest createRequest(Role role, CreateOnboardingRequestDto dto) {
        if (role != Role.HR) {
            throw new BadRequestException("Only HR can create onboarding requests.");
        }

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

    public OnboardingRequest updateRequest(Role role, Long id, UpdateOnboardingRequestDto dto) {
        if (role != Role.HR) {
            throw new BadRequestException("Only HR can update onboarding requests.");
        }

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

    public OnboardingRequest resubmitRequest(Role role, Long id) {
        if (role != Role.HR) {
            throw new BadRequestException("Only HR can resubmit onboarding requests.");
        }

        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.NEEDS_REWORK) {
            throw new BadRequestException("Only requests with NEEDS_REWORK status can be resubmitted.");
        }

        request.setStatus(OnboardingStatus.MANAGER_REVIEW);
        request.setRejectionReason(null);

        return onboardingRequestRepository.save(request);
    }

    public OnboardingRequest approveRequest(Role role, Long id, ITProvisioningDto itProvisioningDto) {
        OnboardingRequest request = getRequestById(id);

        switch (request.getStatus()) {
            case MANAGER_REVIEW -> {
                if (role != Role.MANAGER) {
                    throw new BadRequestException("Only managers can approve requests in MANAGER_REVIEW status.");
                }

                if (request.getHardwareTier() == HardwareTier.PREMIUM) {
                    request.setStatus(OnboardingStatus.FINANCE_APPROVAL);
                } else {
                    request.setStatus(OnboardingStatus.IT_PROVISIONING);
                }
            }

            case FINANCE_APPROVAL -> {
                if (role != Role.FINANCE) {
                    throw new BadRequestException("Only finance users can approve requests in FINANCE_APPROVAL status.");
                }

                request.setStatus(OnboardingStatus.IT_PROVISIONING);
            }

            case IT_PROVISIONING -> {
                if (role != Role.IT) {
                    throw new BadRequestException("Only IT users can complete IT provisioning.");
                }

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

    public OnboardingRequest rejectRequest(Role role, Long id, RejectRequestDto dto) {
        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() == OnboardingStatus.COMPLETED) {
            throw new BadRequestException("Completed requests cannot be rejected.");
        }

        if (request.getStatus() == OnboardingStatus.MANAGER_REVIEW && role != Role.MANAGER) {
            throw new BadRequestException("Only managers can reject requests in MANAGER_REVIEW status.");
        }

        if (request.getStatus() == OnboardingStatus.FINANCE_APPROVAL && role != Role.FINANCE) {
            throw new BadRequestException("Only finance users can reject requests in FINANCE_APPROVAL status.");
        }

        if (request.getStatus() == OnboardingStatus.IT_PROVISIONING && role != Role.IT) {
            throw new BadRequestException("Only IT users can reject requests in IT_PROVISIONING status.");
        }

        request.setStatus(OnboardingStatus.NEEDS_REWORK);
        request.setRejectionReason(dto.getRejectionReason());

        return onboardingRequestRepository.save(request);
    }

    public OnboardingRequest financeApproveRequest(
            Role role,
            Long id,
            FinanceApprovalDto dto
    ) {
        if (role != Role.FINANCE) {
            throw new BadRequestException("Only finance users can approve hardware budget.");
        }

        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.FINANCE_APPROVAL) {
            throw new BadRequestException("Only requests with FINANCE_APPROVAL status can be approved by Finance.");
        }

        if (request.getHardwareTier() != HardwareTier.PREMIUM) {
            throw new BadRequestException("Finance approval is required only for PREMIUM hardware requests.");
        }

        request.setApprovedBudget(dto.getApprovedBudget());
        request.setFinanceNotes(dto.getFinanceNotes());
        request.setStatus(OnboardingStatus.IT_PROVISIONING);

        return onboardingRequestRepository.save(request);
    }
}