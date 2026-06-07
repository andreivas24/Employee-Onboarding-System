package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.enums.HardwareTier;
import com.company.employee_onboarding_system.enums.OnboardingStatus;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OnboardingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OnboardingRequestRepository onboardingRequestRepository;

    @BeforeEach
    void cleanDatabase() {
        onboardingRequestRepository.deleteAll();
    }

    @Test
    void createRequest_ShouldReturnCreatedRequest() throws Exception {
        String requestBody = """
                {
                  "employeeName": "Ion Popescu",
                  "employeeRole": "Java Developer",
                  "startDate": "2026-06-10",
                  "hardwareTier": "STANDARD",
                  "jobDescription": "Responsible for backend development."
                }
                """;

        mockMvc.perform(post("/api/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeName").value("Ion Popescu"))
                .andExpect(jsonPath("$.employeeRole").value("Java Developer"))
                .andExpect(jsonPath("$.hardwareTier").value("STANDARD"))
                .andExpect(jsonPath("$.status").value("MANAGER_REVIEW"));
    }

    @Test
    void getAllRequests_ShouldReturnRequests() throws Exception {
        OnboardingRequest request = createRequestEntity(
                HardwareTier.STANDARD,
                OnboardingStatus.MANAGER_REVIEW
        );

        onboardingRequestRepository.save(request);

        mockMvc.perform(get("/api/onboarding"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].employeeName").value("Test Employee"));
    }

    @Test
    void getRequestById_WhenRequestExists_ShouldReturnRequest() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.STANDARD, OnboardingStatus.MANAGER_REVIEW)
        );

        mockMvc.perform(get("/api/onboarding/" + request.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(request.getId()))
                .andExpect(jsonPath("$.status").value("MANAGER_REVIEW"));
    }

    @Test
    void getRequestById_WhenRequestDoesNotExist_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/onboarding/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void approveStandardRequest_ShouldMoveToITProvisioning() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.STANDARD, OnboardingStatus.MANAGER_REVIEW)
        );

        mockMvc.perform(post("/api/onboarding/" + request.getId() + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IT_PROVISIONING"));
    }

    @Test
    void approvePremiumRequest_ShouldMoveToFinanceApproval() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.PREMIUM, OnboardingStatus.MANAGER_REVIEW)
        );

        mockMvc.perform(post("/api/onboarding/" + request.getId() + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINANCE_APPROVAL"));
    }

    @Test
    void approveITProvisioning_ShouldCompleteRequest() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.STANDARD, OnboardingStatus.IT_PROVISIONING)
        );

        String requestBody = """
                {
                  "companyEmail": "ion.popescu@company.com",
                  "laptopConfiguration": "Dell Latitude, 16GB RAM, 512GB SSD"
                }
                """;

        mockMvc.perform(post("/api/onboarding/" + request.getId() + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.companyEmail").value("ion.popescu@company.com"))
                .andExpect(jsonPath("$.laptopConfiguration").value("Dell Latitude, 16GB RAM, 512GB SSD"));
    }

    @Test
    void rejectRequest_ShouldMoveToNeedsRework() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.STANDARD, OnboardingStatus.MANAGER_REVIEW)
        );

        String requestBody = """
                {
                  "rejectionReason": "Job title is not specific enough."
                }
                """;

        mockMvc.perform(post("/api/onboarding/" + request.getId() + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NEEDS_REWORK"))
                .andExpect(jsonPath("$.rejectionReason").value("Job title is not specific enough."));
    }

    @Test
    void resubmitRequest_ShouldMoveToManagerReview() throws Exception {
        OnboardingRequest request = createRequestEntity(
                HardwareTier.STANDARD,
                OnboardingStatus.NEEDS_REWORK
        );
        request.setRejectionReason("Incorrect role");

        OnboardingRequest savedRequest = onboardingRequestRepository.save(request);

        mockMvc.perform(post("/api/onboarding/" + savedRequest.getId() + "/resubmit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MANAGER_REVIEW"))
                .andExpect(jsonPath("$.rejectionReason").doesNotExist());
    }

    @Test
    void rejectCompletedRequest_ShouldReturn400() throws Exception {
        OnboardingRequest request = onboardingRequestRepository.save(
                createRequestEntity(HardwareTier.STANDARD, OnboardingStatus.COMPLETED)
        );

        String requestBody = """
                {
                  "rejectionReason": "Invalid rejection"
                }
                """;

        mockMvc.perform(post("/api/onboarding/" + request.getId() + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    private OnboardingRequest createRequestEntity(
            HardwareTier hardwareTier,
            OnboardingStatus status
    ) {
        return OnboardingRequest.builder()
                .employeeName("Test Employee")
                .employeeRole("Test Role")
                .startDate(LocalDate.of(2026, 6, 10))
                .hardwareTier(hardwareTier)
                .status(status)
                .jobDescription("Test job description")
                .build();
    }
}