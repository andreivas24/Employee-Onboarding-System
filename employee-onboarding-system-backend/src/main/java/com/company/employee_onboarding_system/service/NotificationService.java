package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.entity.Notification;
import com.company.employee_onboarding_system.enums.NotificationType;
import com.company.employee_onboarding_system.enums.Role;
import com.company.employee_onboarding_system.exception.ResourceNotFoundException;
import com.company.employee_onboarding_system.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
        Long requestId,
        Role targetRole,
        NotificationType type,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .requestId(requestId)
            .targetRole(targetRole)
            .type(type)
            .title(title)
            .message(message)
            .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForRole(Role role) {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role);
    }

    public long getUnreadCount(Role role) {
        return notificationRepository.countByTargetRoleAndReadFalse(role);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Role role) {
        List<Notification> notifications = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role);

        notifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }
}