package com.company.employee_onboarding_system.dto;

import com.company.employee_onboarding_system.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleDto {

    @NotNull
    private Role role;
}