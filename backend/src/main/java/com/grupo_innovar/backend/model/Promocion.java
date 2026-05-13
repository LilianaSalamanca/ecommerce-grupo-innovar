package com.grupo_innovar.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "promociones")
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private String imagen;

    private String botonTexto;

    private String enlace;

    private Boolean activa = true;

    private Integer prioridad = 0;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private LocalDateTime createdAt = LocalDateTime.now();

}