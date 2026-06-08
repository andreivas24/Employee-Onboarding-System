package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.entity.Notification;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.service.NotificationService;
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
        @RequestHeader("X-User-Role") Role role
    ) {
        return notificationService.getNotificationsForRole(role);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(
        @RequestHeader("X-User-Role") Role role
    ) {
        return notificationService.getUnreadCount(role);
    }

    @PostMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead(
        @RequestHeader("X-User-Role") Role role
    ) {
        notificationService.markAllAsRead(role);
    }
}