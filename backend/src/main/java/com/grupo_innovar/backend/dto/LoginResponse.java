package com.grupo_innovar.backend.dto;

public record LoginResponse(
    String token,
    String email,
    String nombre
) {}
