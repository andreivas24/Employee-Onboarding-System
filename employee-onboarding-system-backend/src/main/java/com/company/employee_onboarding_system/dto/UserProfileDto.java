package com.company.employee_onboarding_system.dto;

import com.company.employee_onboarding_system.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileDto {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String profileImageUrl;
    private LocalDateTime createdAt;
}