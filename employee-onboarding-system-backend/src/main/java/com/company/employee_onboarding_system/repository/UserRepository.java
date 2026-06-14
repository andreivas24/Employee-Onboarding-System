package com.company.employee_onboarding_system.repository;

import com.company.employee_onboarding_system.entity.User;
import com.company.employee_onboarding_system.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    long countByRole(Role role);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByRole(Role role);
}