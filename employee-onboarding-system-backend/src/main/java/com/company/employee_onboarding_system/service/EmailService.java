package com.company.employee_onboarding_system.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("Reset your Employee Onboarding password");

            helper.setText("""
                <div style="margin:0;padding:0;background:#f7f8fb;font-family:Arial,sans-serif;">
                    <div style="max-width:620px;margin:0 auto;padding:40px 20px;">
                        <div style="background:#ffffff;border-radius:18px;padding:42px;border:1px solid #dbe5ff;box-shadow:0 12px 32px rgba(15,23,42,0.10);">
                            <h1 style="margin:0 0 14px;color:#07145f;font-size:28px;">
                                Reset your password
                            </h1>
        
                            <p style="color:#6b7280;font-size:15px;line-height:1.6;">
                                Hello,
                            </p>
        
                            <p style="color:#10213f;font-size:15px;line-height:1.6;">
                                We received a request to reset your Employee Onboarding System password.
                            </p>
        
                            <div style="text-align:center;margin:34px 0;">
                                <a href="%s"
                                   style="display:inline-block;background:linear-gradient(90deg,#2d7ff9,#6c4cf5);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;">
                                    Reset Password
                                </a>
                            </div>
        
                            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                                This link expires in <strong>30 minutes</strong>.
                            </p>
        
                            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                                If you did not request this password reset, you can safely ignore this email.
                            </p>
        
                            <hr style="border:none;border-top:1px solid #dbe5ff;margin:28px 0;" />
        
                            <p style="color:#6b7280;font-size:13px;margin:0;">
                                Employee Onboarding System
                            </p>
                        </div>
                    </div>
                </div>
                """.formatted(resetLink), true);

            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException("Failed to send password reset email.");
        }
    }
}