package com.company.employee_onboarding_system.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final MessageService messageService;

    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject(messageService.get("email.password-reset.subject"));
            helper.setText(
                    messageService.get("email.password-reset.body", resetLink),
                    true
            );

            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException(
                    messageService.get("email.password-reset.failed")
            );
        }
    }

    @Async
    public void sendWorkflowEmail(
        String email,
        String subject,
        String title,
        String messageText
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject(subject);

            helper.setText(
                messageService.get("email.workflow.body", title, messageText),
                true
            );

            mailSender.send(message);
        } catch (Exception exception) {
            throw new RuntimeException(
                messageService.get("email.workflow.failed"),
                exception
            );
        }
    }
}