package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.dto.UpdateUserRoleDto;
import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.BadRequestException;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<User> getAllUsers(Role currentUserRole) {
        validateAdmin(currentUserRole);
        return userRepository.findAll();
    }

    public User updateUserRole(
        Role currentUserRole,
        Long userId,
        UpdateUserRoleDto dto
    ) {
        validateAdmin(currentUserRole);

        User user = userRepository.findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "User not found with id: " + userId
                ));

        long adminCount = userRepository.countByRole(Role.ADMIN);

        if (user.getRole() == Role.ADMIN
            && dto.getRole() != Role.ADMIN
            && adminCount == 1) {

            throw new BadRequestException(
                    "At least one ADMIN account must remain in the system."
            );
        }

        user.setRole(dto.getRole());

        return userRepository.save(user);
    }

    private void validateAdmin(Role role) {
        if (role != Role.ADMIN) {
            throw new BadRequestException("Only admins can perform this action.");
        }
    }
}