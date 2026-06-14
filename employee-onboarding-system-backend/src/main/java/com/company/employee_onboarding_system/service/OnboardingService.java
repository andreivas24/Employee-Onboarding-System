package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.*;
import com.company.employee_onboarding_system.entity.OnboardingHistory;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.*;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingRequestRepository onboardingRequestRepository;
    private final OnboardingHistoryRepository onboardingHistoryRepository;
    private final OnboardingCommentRepository onboardingCommentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MessageService messageService;
    private final EmailService emailService;

    public OnboardingRequest createRequest(Role role, CreateOnboardingRequestDto dto) {
        if (role != Role.HR) {
            throw new BadRequestException(messageService.get("onboarding.create.only-hr"));
        }

        boolean duplicateExists = onboardingRequestRepository
            .existsByEmployeeNameIgnoreCaseAndEmployeeRoleIgnoreCaseAndStartDate(
                dto.getEmployeeName().trim(),
                dto.getEmployeeRole().trim(),
                dto.getStartDate()
            );

        if (duplicateExists) {
            throw new BadRequestException(messageService.get("onboarding.create.duplicate"));
        }

        OnboardingRequest request = OnboardingRequest.builder()
            .employeeName(dto.getEmployeeName().trim())
            .employeeRole(dto.getEmployeeRole().trim())
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
            messageService.get("history.created")
        );

        notifyRole(
            savedRequest.getId(),
            Role.MANAGER,
            NotificationType.REQUEST_CREATED,
            messageService.get("notification.request-created.title"),
            messageService.get(
                "notification.request-created.message",
                savedRequest.getEmployeeName()
            )
        );

        sendEmailToRole(
            Role.MANAGER,
            messageService.get("email.request-created.subject"),
            messageService.get("notification.request-created.title"),
            messageService.get(
                "notification.request-created.message",
                savedRequest.getEmployeeName()
            )
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
                        messageService.get("onboarding.not-found", id)
                    )
            );
    }

    public OnboardingRequest updateRequest(Role role, Long id, UpdateOnboardingRequestDto dto) {
        if (role != Role.HR) {
            throw new BadRequestException(messageService.get("onboarding.update.only-hr"));
        }

        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.NEEDS_REWORK) {
            throw new BadRequestException(
                messageService.get("onboarding.update.only-needs-rework")
            );
        }

        request.setEmployeeName(dto.getEmployeeName().trim());
        request.setEmployeeRole(dto.getEmployeeRole().trim());
        request.setStartDate(dto.getStartDate());
        request.setHardwareTier(dto.getHardwareTier());
        request.setJobDescription(dto.getJobDescription());

        OnboardingRequest updatedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            updatedRequest.getId(),
            HistoryAction.UPDATED,
            role,
            messageService.get("history.updated")
        );

        return updatedRequest;
    }

    public OnboardingRequest resubmitRequest(Role role, Long id) {
        if (role != Role.HR) {
            throw new BadRequestException(messageService.get("onboarding.resubmit.only-hr"));
        }

        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.NEEDS_REWORK) {
            throw new BadRequestException(
                messageService.get("onboarding.resubmit.only-needs-rework")
            );
        }

        request.setStatus(OnboardingStatus.MANAGER_REVIEW);
        request.setRejectionReason(null);

        OnboardingRequest resubmittedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            resubmittedRequest.getId(),
            HistoryAction.RESUBMITTED,
            role,
            messageService.get("history.resubmitted")
        );

        notifyRole(
            resubmittedRequest.getId(),
            Role.MANAGER,
            NotificationType.REQUEST_RESUBMITTED,
            messageService.get("notification.request-resubmitted.title"),
            messageService.get(
                "notification.request-resubmitted.message",
                resubmittedRequest.getEmployeeName()
            )
        );

        sendEmailToRole(
            Role.MANAGER,
            messageService.get("email.request-resubmitted.subject"),
            messageService.get("notification.request-resubmitted.title"),
            messageService.get(
                "notification.request-resubmitted.message",
                resubmittedRequest.getEmployeeName()
            )
        );

        return resubmittedRequest;
    }

    public OnboardingRequest approveRequest(
        Role role,
        Long id,
        ITProvisioningDto itProvisioningDto
    ) {
        OnboardingRequest request = getRequestById(id);

        switch (request.getStatus()) {
            case MANAGER_REVIEW -> {
                if (role != Role.MANAGER) {
                    throw new BadRequestException(
                            messageService.get("onboarding.approve.manager-only")
                    );
                }

                if (request.getHardwareTier() == HardwareTier.PREMIUM) {
                    request.setStatus(OnboardingStatus.FINANCE_APPROVAL);
                } else {
                    request.setStatus(OnboardingStatus.IT_PROVISIONING);
                }
            }

            case FINANCE_APPROVAL -> throw new BadRequestException(
                messageService.get("onboarding.approve.finance-endpoint-required")
            );

            case IT_PROVISIONING -> {
                if (role != Role.IT) {
                    throw new BadRequestException(
                        messageService.get("onboarding.approve.it-only")
                    );
                }

                if (itProvisioningDto == null) {
                    throw new BadRequestException(
                        messageService.get("onboarding.approve.it-details-required")
                    );
                }

                request.setCompanyEmail(itProvisioningDto.getCompanyEmail());
                request.setLaptopConfiguration(itProvisioningDto.getLaptopConfiguration());
                request.setStatus(OnboardingStatus.COMPLETED);
            }

            default -> throw new BadRequestException(
                messageService.get(
                    "onboarding.approve.invalid-status",
                    request.getStatus()
                )
            );
        }

        OnboardingRequest approvedRequest = onboardingRequestRepository.save(request);

        HistoryAction action;
        String notes;

        if (role == Role.MANAGER) {
            action = HistoryAction.MANAGER_APPROVED;
            notes = request.getHardwareTier() == HardwareTier.PREMIUM
                ? messageService.get("history.manager-approved.premium")
                : messageService.get("history.manager-approved.standard");
        } else if (role == Role.IT) {
            action = HistoryAction.IT_COMPLETED;
            notes = messageService.get("history.it-completed");
        } else {
            action = HistoryAction.MANAGER_APPROVED;
            notes = messageService.get("history.request-approved");
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
                    messageService.get("notification.finance-required.title"),
                    messageService.get(
                        "notification.finance-required.message",
                        approvedRequest.getEmployeeName()
                    )
                );

                sendEmailToRole(
                    Role.FINANCE,
                    messageService.get("email.finance-required.subject"),
                    messageService.get("notification.finance-required.title"),
                    messageService.get(
                        "notification.finance-required.message",
                        approvedRequest.getEmployeeName()
                    )
                );
            }

            if (approvedRequest.getStatus() == OnboardingStatus.IT_PROVISIONING) {
                notifyRole(
                    approvedRequest.getId(),
                    Role.IT,
                    NotificationType.REQUEST_APPROVED,
                    messageService.get("notification.it-required.title"),
                    messageService.get(
                        "notification.it-required.message",
                        approvedRequest.getEmployeeName()
                    )
                );

                sendEmailToRole(
                    Role.IT,
                    messageService.get("email.it-required.subject"),
                    messageService.get("notification.it-required.title"),
                    messageService.get(
                        "notification.it-required.message",
                        approvedRequest.getEmployeeName()
                    )
                );
            }
        }

        if (role == Role.IT) {
            notifyRole(
                approvedRequest.getId(),
                Role.HR,
                NotificationType.IT_COMPLETED,
                messageService.get("notification.it-completed.title"),
                messageService.get(
                    "notification.it-completed.message",
                    approvedRequest.getEmployeeName()
                )
            );

            sendEmailToRole(
                Role.IT,
                messageService.get("email.finance-approved.subject"),
                messageService.get("notification.finance-approved.title"),
                messageService.get(
                    "notification.finance-approved.message",
                    approvedRequest.getEmployeeName()
                )
            );
        }

        return approvedRequest;
    }

    public OnboardingRequest rejectRequest(Role role, Long id, RejectRequestDto dto) {
        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() == OnboardingStatus.COMPLETED) {
            throw new BadRequestException(messageService.get("onboarding.reject.completed"));
        }

        if (request.getStatus() == OnboardingStatus.MANAGER_REVIEW && role != Role.MANAGER) {
            throw new BadRequestException(messageService.get("onboarding.reject.manager-only"));
        }

        if (request.getStatus() == OnboardingStatus.FINANCE_APPROVAL && role != Role.FINANCE) {
            throw new BadRequestException(messageService.get("onboarding.reject.finance-only"));
        }

        if (request.getStatus() == OnboardingStatus.IT_PROVISIONING && role != Role.IT) {
            throw new BadRequestException(messageService.get("onboarding.reject.it-only"));
        }

        request.setStatus(OnboardingStatus.NEEDS_REWORK);
        request.setRejectionReason(dto.getRejectionReason());

        OnboardingRequest rejectedRequest = onboardingRequestRepository.save(request);

        saveHistory(
            rejectedRequest.getId(),
            HistoryAction.REJECTED,
            role,
            messageService.get("history.rejected", dto.getRejectionReason())
        );

        notifyRole(
            rejectedRequest.getId(),
            Role.HR,
            NotificationType.REQUEST_REJECTED,
            messageService.get("notification.request-rejected.title"),
            messageService.get(
                "notification.request-rejected.message",
                rejectedRequest.getEmployeeName(),
                dto.getRejectionReason()
            )
        );

        sendEmailToRole(
            Role.HR,
            messageService.get("email.request-rejected.subject"),
            messageService.get("notification.request-rejected.title"),
            messageService.get(
                "notification.request-rejected.message",
                rejectedRequest.getEmployeeName(),
                dto.getRejectionReason()
            )
        );

        return rejectedRequest;
    }

    public OnboardingRequest financeApproveRequest(
        Role role,
        Long id,
        FinanceApprovalDto dto
    ) {
        if (role != Role.FINANCE) {
            throw new BadRequestException(messageService.get("onboarding.finance.only-finance"));
        }

        OnboardingRequest request = getRequestById(id);

        if (request.getStatus() != OnboardingStatus.FINANCE_APPROVAL) {
            throw new BadRequestException(
                messageService.get("onboarding.finance.only-finance-status")
            );
        }

        if (request.getHardwareTier() != HardwareTier.PREMIUM) {
            throw new BadRequestException(messageService.get("onboarding.finance.only-premium"));
        }

        request.setApprovedBudget(dto.getApprovedBudget());
        request.setFinanceNotes(dto.getFinanceNotes());
        request.setStatus(OnboardingStatus.IT_PROVISIONING);

        OnboardingRequest approvedRequest = onboardingRequestRepository.save(request);

        saveHistory(
                approvedRequest.getId(),
                HistoryAction.FINANCE_APPROVED,
                role,
                messageService.get(
                    "history.finance-approved",
                    dto.getApprovedBudget(),
                    dto.getFinanceNotes()
                )
        );

        notifyRole(
            approvedRequest.getId(),
            Role.IT,
            NotificationType.FINANCE_APPROVED,
            messageService.get("notification.finance-approved.title"),
            messageService.get(
                "notification.finance-approved.message",
                approvedRequest.getEmployeeName()
            )
        );

        sendEmailToRole(
            Role.IT,
            messageService.get("email.finance-approved.subject"),
            messageService.get("notification.finance-approved.title"),
            messageService.get(
                "notification.finance-approved.message",
                approvedRequest.getEmployeeName()
            )
        );

        return approvedRequest;
    }

    public List<OnboardingHistory> getHistoryByRequestId(Long requestId) {
        getRequestById(requestId);

        return onboardingHistoryRepository.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    @Transactional
    public void deleteRequest(Role role, Long id) {
        if (role != Role.ADMIN) {
            throw new BadRequestException(messageService.get("onboarding.delete.only-admin"));
        }

        OnboardingRequest request = getRequestById(id);

        onboardingHistoryRepository.deleteByRequestId(id);
        onboardingCommentRepository.deleteByRequestId(id);
        notificationRepository.deleteByRequestId(id);

        onboardingRequestRepository.delete(request);
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

    private void sendEmailToRole(
        Role role,
        String subject,
        String title,
        String message
    ) {
        List<User> users = userRepository.findAllByRole(role);

        for (User user : users) {
            try {
                emailService.sendWorkflowEmail(
                    user.getEmail(),
                    subject,
                    title,
                    message
                );
            } catch (Exception exception) {
                System.err.println(
                        messageService.get("email.workflow.send.failed", user.getEmail())
                );
                exception.printStackTrace();
            }
        }
    }
}