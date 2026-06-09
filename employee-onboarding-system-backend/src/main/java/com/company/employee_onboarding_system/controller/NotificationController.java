package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.entity.Notification;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotificationsForRole(
        HttpServletRequest request
    ) {
        Role role = getRoleFromToken(request);
        return notificationService.getNotificationsForRole(role);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(
        HttpServletRequest request
    ) {
        Role role = getRoleFromToken(request);
        return notificationService.getUnreadCount(role);
    }

    @PostMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead(
        HttpServletRequest request
    ) {
        Role role = getRoleFromToken(request);
        notificationService.markAllAsRead(role);
    }

    private Role getRoleFromToken(HttpServletRequest request) {
        return Role.valueOf((String) request.getAttribute("userRole"));
    }
}