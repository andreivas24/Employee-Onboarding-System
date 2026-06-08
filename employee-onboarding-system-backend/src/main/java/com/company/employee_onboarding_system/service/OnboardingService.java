package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.*;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.*;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.entity.OnboardingHistory;
import com.company.employee_onboarding_system.repository.OnboardingHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingRequestRepository onboardingRequestRepository;
    private final OnboardingHistoryRepository onboardingHistoryRepository;
    private final NotificationService notificationService;

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

        OnboardingRequest savedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            savedRequest.getId(),
            HistoryAction.CREATED,
            role,
            "Onboarding request created and sent to Manager Review."
        );

        notifyRole(
            savedRequest.getId(),
            Role.MANAGER,
            NotificationType.REQUEST_CREATED,
            "New onboarding request",
            "HR created a new onboarding request for "
                + savedRequest.getEmployeeName()
                + ". It is waiting for Manager Review."
        );

        return savedRequest;
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

        OnboardingRequest updatedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            updatedRequest.getId(),
            HistoryAction.UPDATED,
            role,
            "Request details updated by HR."
        );

        return updatedRequest;
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

        OnboardingRequest resubmittedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            resubmittedRequest.getId(),
            HistoryAction.RESUBMITTED,
            role,
            "Request resubmitted and sent back to Manager Review."
        );

        notifyRole(
            resubmittedRequest.getId(),
            Role.MANAGER,
            NotificationType.REQUEST_RESUBMITTED,
            "Request resubmitted",
            "HR resubmitted the onboarding request for "
                + resubmittedRequest.getEmployeeName()
                + ". It is waiting for Manager Review."
        );

        return resubmittedRequest;
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

            case FINANCE_APPROVAL -> throw new BadRequestException(
                "Finance approval requires budget details. Please use the finance approval endpoint."
            );

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

        OnboardingRequest approvedRequest = onboardingRequestRepository.save(request);

        HistoryAction action;
        String notes;

        if (role == Role.MANAGER) {
            action = HistoryAction.MANAGER_APPROVED;

            notes = request.getHardwareTier() == HardwareTier.PREMIUM
                ? "Manager approved request. Premium hardware requires Finance approval."
                : "Manager approved request. Standard hardware sent directly to IT Provisioning.";
        } else if (role == Role.IT) {
            action = HistoryAction.IT_COMPLETED;
            notes = "IT completed account setup and laptop provisioning.";
        } else {
            action = HistoryAction.MANAGER_APPROVED;
            notes = "Request approved.";
        }

        saveHistory(
            approvedRequest.getId(),
            action,
            role,
            notes
        );

        if (role == Role.MANAGER) {
            if (approvedRequest.getStatus() == OnboardingStatus.FINANCE_APPROVAL) {
                notifyRole(
                    approvedRequest.getId(),
                    Role.FINANCE,
                    NotificationType.REQUEST_APPROVED,
                    "Finance approval required",
                    "Manager approved the request for "
                        + approvedRequest.getEmployeeName()
                        + ". Premium hardware budget approval is required."
                );
            }

            if (approvedRequest.getStatus() == OnboardingStatus.IT_PROVISIONING) {
                notifyRole(
                    approvedRequest.getId(),
                    Role.IT,
                    NotificationType.REQUEST_APPROVED,
                    "IT provisioning required",
                    "Manager approved the request for "
                        + approvedRequest.getEmployeeName()
                        + ". IT provisioning can now start."
                );
            }
        }

        if (role == Role.IT) {
            notifyRole(
                approvedRequest.getId(),
                Role.HR,
                NotificationType.IT_COMPLETED,
                "Onboarding completed",
                "IT completed provisioning for "
                    + approvedRequest.getEmployeeName()
                    + ". The onboarding request is now completed."
            );
        }

        return approvedRequest;
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

        OnboardingRequest rejectedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            rejectedRequest.getId(),
            HistoryAction.REJECTED,
            role,
            "Request rejected. Reason: " + dto.getRejectionReason()
        );

        notifyRole(
            rejectedRequest.getId(),
            Role.HR,
            NotificationType.REQUEST_REJECTED,
            "Request rejected",
            "The onboarding request for "
                + rejectedRequest.getEmployeeName()
                + " was rejected. Reason: "
                + dto.getRejectionReason()
        );

        return rejectedRequest;
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

        OnboardingRequest approvedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            approvedRequest.getId(),
            HistoryAction.FINANCE_APPROVED,
            role,
            "Finance approved hardware budget: " + dto.getApprovedBudget()
                + ". Notes: " + dto.getFinanceNotes()
        );

        notifyRole(
            approvedRequest.getId(),
            Role.IT,
            NotificationType.FINANCE_APPROVED,
            "IT provisioning required",
            "Finance approved the hardware budget for "
                + approvedRequest.getEmployeeName()
                + ". IT provisioning can now start."
        );

        return approvedRequest;
    }

    public List<OnboardingHistory> getHistoryByRequestId(Long requestId) {
        getRequestById(requestId);

        return onboardingHistoryRepository.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    private void saveHistory(
            Long requestId,
            HistoryAction action,
            Role role,
            String notes
    ) {
        OnboardingHistory history = OnboardingHistory.builder()
            .requestId(requestId)
            .action(action)
            .performedByRole(role)
            .notes(notes)
            .build();

        onboardingHistoryRepository.save(history);
    }

    private void notifyRole(
            Long requestId,
            Role targetRole,
            NotificationType type,
            String title,
            String message
    ) {
        notificationService.createNotification(
            requestId,
            targetRole,
            type,
            title,
            message
        );
    }

    public DashboardStatsDto getDashboardStats() {
        return new DashboardStatsDto(
            onboardingRequestRepository.count(),
            onboardingRequestRepository.countByStatus(OnboardingStatus.MANAGER_REVIEW),
            onboardingRequestRepository.countByStatus(OnboardingStatus.FINANCE_APPROVAL),
            onboardingRequestRepository.countByStatus(OnboardingStatus.IT_PROVISIONING),
            onboardingRequestRepository.countByStatus(OnboardingStatus.NEEDS_REWORK),
            onboardingRequestRepository.countByStatus(OnboardingStatus.COMPLETED),
            onboardingRequestRepository.countByHardwareTier(HardwareTier.STANDARD),
            onboardingRequestRepository.countByHardwareTier(HardwareTier.PREMIUM)
        );
    }
}