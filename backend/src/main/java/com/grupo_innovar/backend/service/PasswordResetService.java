package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.PasswordResetToken;
import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.PasswordResetTokenRepository;
import com.grupo_innovar.backend.repository.UsuarioRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;

    private final UsuarioRepository usuarioRepo;

    private final PasswordEncoder encoder;

    private final EmailService emailService;

    @Transactional
    public void processForgotPassword(
            String email
    ) {

        usuarioRepo.findByEmail(email)
                .ifPresent(user -> {

                    tokenRepo.deleteByUsuarioId(
                            user.getId()
                    );

                    String rawToken =
                            generateSecureToken();

                    PasswordResetToken prt =
                            new PasswordResetToken();

                    prt.setUsuario(user);

                    prt.setToken(
                            encoder.encode(rawToken)
                    );

                    prt.setExpiryDate(
                            LocalDateTime.now()
                                    .plusMinutes(30)
                    );

                    prt.setUsed(false);

                    tokenRepo.save(prt);

                    emailService.sendPasswordResetEmail(
                            user.getEmail(),
                            rawToken
                    );
                });
    }

    @Transactional
    public void resetPassword(
            String rawToken,
            String newPassword
    ) {

        PasswordResetToken validToken =
                tokenRepo.findAll()
                        .stream()
                        .filter(t ->
                                encoder.matches(
                                        rawToken,
                                        t.getToken()
                                )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Token inválido"
                                )
                        );

        if (validToken.isUsed()) {

            throw new RuntimeException(
                    "Token ya usado"
            );
        }

        if (
                validToken.getExpiryDate()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Token expirado"
            );
        }

        Usuario user =
                validToken.getUsuario();

        user.setPasswordHash(
                encoder.encode(newPassword)
        );

        usuarioRepo.save(user);

        validToken.setUsed(true);

        tokenRepo.save(validToken);
    }

    private String generateSecureToken() {

        SecureRandom secureRandom =
                new SecureRandom();

        byte[] bytes =
                new byte[32];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }
}