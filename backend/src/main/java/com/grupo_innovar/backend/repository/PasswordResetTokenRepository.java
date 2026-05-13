package com.grupo_innovar.backend.repository;

import com.grupo_innovar.backend.model.PasswordResetToken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("""
        DELETE FROM PasswordResetToken p
        WHERE p.usuario.id = :usuarioId
    """)
    void deleteByUsuarioId(
            @Param("usuarioId") Long usuarioId
    );
}