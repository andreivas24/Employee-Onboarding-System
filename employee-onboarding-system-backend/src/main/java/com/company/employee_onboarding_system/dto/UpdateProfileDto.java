package com.company.employee_onboarding_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileDto {

    @NotBlank
    private String fullName;
}