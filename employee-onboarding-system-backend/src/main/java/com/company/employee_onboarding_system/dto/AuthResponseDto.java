package com.company.employee_onboarding_system.dto;

import com.company.employee_onboarding_system.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String profileImageUrl;
    private String token;
}