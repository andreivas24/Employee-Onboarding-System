package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.AuthResponseDto;
import com.company.employee_onboarding_system.dto.LoginRequestDto;
import com.company.employee_onboarding_system.dto.RegisterRequestDto;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.repository.UserRepository;
import com.company.employee_onboarding_system.dto.ForgotPasswordRequestDto;
import com.company.employee_onboarding_system.dto.ResetPasswordRequestDto;
import com.company.employee_onboarding_system.entity.PasswordResetToken;
import com.company.employee_onboarding_system.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

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
            user.getRole(),
            user.getProfileImageUrl(),
            jwtService.generateToken(user)
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException("No user found with this email."));

        passwordResetTokenRepository.deleteByEmail(user.getEmail());

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(user.getEmail())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(ResetPasswordRequestDto dto) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("Reset token has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired.");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found."));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}