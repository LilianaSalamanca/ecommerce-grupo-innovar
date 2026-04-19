package com.grupo_innovar.backend.dto;

public record UsuarioProfileDTO(
    String nombre,
    String apellido,
    String email,
    String telefono,
    String direccion,
    String ciudad,
    String departamento,
    boolean activo
) {}