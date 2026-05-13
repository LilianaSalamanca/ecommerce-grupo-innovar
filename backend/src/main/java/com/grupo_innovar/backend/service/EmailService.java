package com.grupo_innovar.backend.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(
            String to,
            String token) {

        String resetUrl = frontendUrl +
                "/reset-password?token=" +
                token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);

        message.setSubject(
                "Restablecer contraseña");

        message.setText(
                """
                        Has solicitado restablecer tu contraseña.

                        Usa el siguiente enlace:

                        %s

                        Este enlace expirará en 30 minutos.

                        Si no solicitaste este cambio, ignora este mensaje.
                        """
                        .formatted(resetUrl));

        mailSender.send(message);
    }
}