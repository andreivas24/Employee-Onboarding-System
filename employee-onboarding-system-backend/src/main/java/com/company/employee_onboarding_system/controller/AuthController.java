package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.AuthResponseDto;
import com.company.employee_onboarding_system.dto.LoginRequestDto;
import com.company.employee_onboarding_system.dto.RegisterRequestDto;
import com.company.employee_onboarding_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto dto) {
        return authService.register(dto);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto dto) {
        return authService.login(dto);
    }
}