package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.UpdateProfileDto;
import com.company.employee_onboarding_system.dto.UserProfileDto;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final MessageService messageService;

    public UserProfileDto getProfile(String email) {
        User user = findUserByEmail(email);
        return mapToDto(user);
    }

    public UserProfileDto updateProfile(String email, UpdateProfileDto dto) {
        User user = findUserByEmail(email);
        user.setFullName(dto.getFullName());
        User savedUser = userRepository.save(user);

        return mapToDto(savedUser);
    }

    public UserProfileDto updateAvatarFile(String email, String fileName) {
        User user = findUserByEmail(email);

        user.setProfileImageUrl("/uploads/" + fileName);

        User savedUser = userRepository.save(user);

        return mapToDto(savedUser);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    messageService.get("profile.user.not-found", email)
                ));
    }

    private UserProfileDto mapToDto(User user) {
        return new UserProfileDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            user.getProfileImageUrl(),
            user.getCreatedAt()
        );
    }
}