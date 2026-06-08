package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.CreateOnboardingRequestDto;
import com.company.employee_onboarding_system.dto.ITProvisioningDto;
import com.company.employee_onboarding_system.dto.RejectRequestDto;
import com.company.employee_onboarding_system.dto.UpdateOnboardingRequestDto;
import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.HardwareTier;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceTest {

    @Mock
    private OnboardingRequestRepository onboardingRequestRepository;

    @InjectMocks
    private OnboardingService onboardingService;

    @Test
    void createRequest_ShouldCreateRequestWithManagerReviewStatus() {
        CreateOnboardingRequestDto dto = new CreateOnboardingRequestDto();
        dto.setEmployeeName("Ion Popescu");
        dto.setEmployeeRole("Java Developer");
        dto.setStartDate(LocalDate.of(2026, 6, 10));
        dto.setHardwareTier(HardwareTier.STANDARD);
        dto.setJobDescription("Backend developer");

        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.createRequest(Role.HR, dto);

        assertEquals("Ion Popescu", result.getEmployeeName());
        assertEquals("Java Developer", result.getEmployeeRole());
        assertEquals(HardwareTier.STANDARD, result.getHardwareTier());
        assertEquals(OnboardingStatus.MANAGER_REVIEW, result.getStatus());

        verify(onboardingRequestRepository, times(1)).save(any(OnboardingRequest.class));
    }

    @Test
    void getRequestById_WhenRequestExists_ShouldReturnRequest() {
        OnboardingRequest request = createRequestEntity(
                1L,
                HardwareTier.STANDARD,
                OnboardingStatus.MANAGER_REVIEW
        );

        when(onboardingRequestRepository.findById(1L)).thenReturn(Optional.of(request));

        OnboardingRequest result = onboardingService.getRequestById(1L);

        assertEquals(1L, result.getId());
        assertEquals(OnboardingStatus.MANAGER_REVIEW, result.getStatus());
    }

    @Test
    void getRequestById_WhenRequestDoesNotExist_ShouldThrowResourceNotFoundException() {
        when(onboardingRequestRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> onboardingService.getRequestById(99L)
        );
    }

    @Test
    void approveStandardRequest_ShouldMoveToITProvisioning() {
        OnboardingRequest request = createRequestEntity(
                1L,
                HardwareTier.STANDARD,
                OnboardingStatus.MANAGER_REVIEW
        );

        when(onboardingRequestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.approveRequest(Role.MANAGER,1L, null);

        assertEquals(OnboardingStatus.IT_PROVISIONING, result.getStatus());
    }

    @Test
    void approvePremiumRequest_ShouldMoveToFinanceApproval() {
        OnboardingRequest request = createRequestEntity(
                2L,
                HardwareTier.PREMIUM,
                OnboardingStatus.MANAGER_REVIEW
        );

        when(onboardingRequestRepository.findById(2L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.approveRequest(Role.MANAGER,2L, null);

        assertEquals(OnboardingStatus.FINANCE_APPROVAL, result.getStatus());
    }

    @Test
    void approveFinanceRequest_ShouldMoveToITProvisioning() {
        OnboardingRequest request = createRequestEntity(
                2L,
                HardwareTier.PREMIUM,
                OnboardingStatus.FINANCE_APPROVAL
        );

        when(onboardingRequestRepository.findById(2L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.approveRequest(Role.FINANCE,2L, null);

        assertEquals(OnboardingStatus.IT_PROVISIONING, result.getStatus());
    }

    @Test
    void approveITProvisioning_ShouldCompleteRequest() {
        OnboardingRequest request = createRequestEntity(
                3L,
                HardwareTier.STANDARD,
                OnboardingStatus.IT_PROVISIONING
        );

        ITProvisioningDto dto = new ITProvisioningDto();
        dto.setCompanyEmail("ion.popescu@company.com");
        dto.setLaptopConfiguration("Dell Latitude, 16GB RAM, 512GB SSD");

        when(onboardingRequestRepository.findById(3L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.approveRequest(Role.IT,3L, dto);

        assertEquals(OnboardingStatus.COMPLETED, result.getStatus());
        assertEquals("ion.popescu@company.com", result.getCompanyEmail());
        assertEquals("Dell Latitude, 16GB RAM, 512GB SSD", result.getLaptopConfiguration());
    }

    @Test
    void approveITProvisioningWithoutDetails_ShouldThrowBadRequestException() {
        OnboardingRequest request = createRequestEntity(
                3L,
                HardwareTier.STANDARD,
                OnboardingStatus.IT_PROVISIONING
        );

        when(onboardingRequestRepository.findById(3L)).thenReturn(Optional.of(request));

        assertThrows(
                BadRequestException.class,
                () -> onboardingService.approveRequest(Role.IT,3L, null)
        );
    }

    @Test
    void rejectRequest_ShouldMoveToNeedsRework() {
        OnboardingRequest request = createRequestEntity(
                4L,
                HardwareTier.STANDARD,
                OnboardingStatus.MANAGER_REVIEW
        );

        RejectRequestDto dto = new RejectRequestDto();
        dto.setRejectionReason("Job title is not specific enough.");

        when(onboardingRequestRepository.findById(4L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.rejectRequest(Role.MANAGER, 4L, dto);

        assertEquals(OnboardingStatus.NEEDS_REWORK, result.getStatus());
        assertEquals("Job title is not specific enough.", result.getRejectionReason());
    }

    @Test
    void rejectCompletedRequest_ShouldThrowBadRequestException() {
        OnboardingRequest request = createRequestEntity(
                5L,
                HardwareTier.STANDARD,
                OnboardingStatus.COMPLETED
        );

        RejectRequestDto dto = new RejectRequestDto();
        dto.setRejectionReason("Invalid rejection");

        when(onboardingRequestRepository.findById(5L)).thenReturn(Optional.of(request));

        assertThrows(
                BadRequestException.class,
                () -> onboardingService.rejectRequest(Role.MANAGER,5L, dto)
        );
    }

    @Test
    void updateNeedsReworkRequest_ShouldUpdateRequestDetails() {
        OnboardingRequest request = createRequestEntity(
                6L,
                HardwareTier.STANDARD,
                OnboardingStatus.NEEDS_REWORK
        );

        UpdateOnboardingRequestDto dto = new UpdateOnboardingRequestDto();
        dto.setEmployeeName("Alex Dumitru");
        dto.setEmployeeRole("Automation QA Engineer");
        dto.setStartDate(LocalDate.of(2026, 6, 20));
        dto.setHardwareTier(HardwareTier.STANDARD);
        dto.setJobDescription("Responsible for automated testing.");

        when(onboardingRequestRepository.findById(6L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.updateRequest(Role.HR,6L, dto);

        assertEquals("Alex Dumitru", result.getEmployeeName());
        assertEquals("Automation QA Engineer", result.getEmployeeRole());
        assertEquals("Responsible for automated testing.", result.getJobDescription());
        assertEquals(OnboardingStatus.NEEDS_REWORK, result.getStatus());
    }

    @Test
    void updateRequestWhenNotNeedsRework_ShouldThrowBadRequestException() {
        OnboardingRequest request = createRequestEntity(
                7L,
                HardwareTier.STANDARD,
                OnboardingStatus.MANAGER_REVIEW
        );

        UpdateOnboardingRequestDto dto = new UpdateOnboardingRequestDto();

        when(onboardingRequestRepository.findById(7L)).thenReturn(Optional.of(request));

        assertThrows(
                BadRequestException.class,
                () -> onboardingService.updateRequest(Role.HR,7L, dto)
        );
    }

    @Test
    void resubmitNeedsReworkRequest_ShouldMoveToManagerReview() {
        OnboardingRequest request = createRequestEntity(
                8L,
                HardwareTier.STANDARD,
                OnboardingStatus.NEEDS_REWORK
        );
        request.setRejectionReason("Incorrect role");

        when(onboardingRequestRepository.findById(8L)).thenReturn(Optional.of(request));
        when(onboardingRequestRepository.save(any(OnboardingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OnboardingRequest result = onboardingService.resubmitRequest(Role.HR,8L);

        assertEquals(OnboardingStatus.MANAGER_REVIEW, result.getStatus());
        assertNull(result.getRejectionReason());
    }

    private OnboardingRequest createRequestEntity(
            Long id,
            HardwareTier hardwareTier,
            OnboardingStatus status
    ) {
        return OnboardingRequest.builder()
                .id(id)
                .employeeName("Test Employee")
                .employeeRole("Test Role")
                .startDate(LocalDate.of(2026, 6, 10))
                .hardwareTier(hardwareTier)
                .status(status)
                .jobDescription("Test job description")
                .build();
    }
}