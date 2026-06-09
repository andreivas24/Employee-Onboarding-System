package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.UpdateUserRoleDto;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<User> getAllUsers(
        HttpServletRequest request
    ) {
        Role role = getRoleFromToken(request);
        return adminService.getAllUsers(role);
    }

    @PutMapping("/users/{id}/role")
    public User updateUserRole(
        HttpServletRequest request,
        @PathVariable Long id,
        @Valid @RequestBody UpdateUserRoleDto dto
    ) {
        Role role = getRoleFromToken(request);
        return adminService.updateUserRole(role, id, dto);
    }

    private Role getRoleFromToken(HttpServletRequest request) {
        return Role.valueOf((String) request.getAttribute("userRole"));
    }
}