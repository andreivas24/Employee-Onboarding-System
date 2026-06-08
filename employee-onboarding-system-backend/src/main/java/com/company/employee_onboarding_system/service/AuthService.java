package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.AuthResponseDto;
import com.company.employee_onboarding_system.dto.LoginRequestDto;
import com.company.employee_onboarding_system.dto.RegisterRequestDto;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponseDto register(RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = User.builder()
            .fullName(dto.getFullName())
            .email(dto.getEmail())
            .password(passwordEncoder.encode(dto.getPassword()))
            .role(Role.VIEWER)
            .build();

        User savedUser = userRepository.save(user);

        return mapToAuthResponse(savedUser);
    }

    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        return mapToAuthResponse(user);
    }

    private AuthResponseDto mapToAuthResponse(User user) {
        return new AuthResponseDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole()
        );
    }
}