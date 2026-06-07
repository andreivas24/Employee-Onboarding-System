package com.company.employee_onboarding_system.dto;

import com.company.employee_onboarding_system.enums.HardwareTier;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateOnboardingRequestDto {

    @NotBlank
    private String employeeName;

    @NotBlank
    private String employeeRole;

    @NotNull
    @FutureOrPresent
    private LocalDate startDate;

    @NotNull
    private HardwareTier hardwareTier;

    private String jobDescription;
}