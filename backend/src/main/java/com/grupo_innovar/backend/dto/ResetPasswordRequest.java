package com.grupo_innovar.backend.dto;

public record ResetPasswordRequest(
        String token,
        String password) {
}