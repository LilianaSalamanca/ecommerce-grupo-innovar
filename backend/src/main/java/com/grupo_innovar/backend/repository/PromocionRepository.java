package com.grupo_innovar.backend.repository;

import com.grupo_innovar.backend.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    @Query("""
        SELECT p FROM Promocion p
        WHERE p.activa = true
        AND (
            p.fechaInicio IS NULL
            OR p.fechaInicio <= :fecha
        )
        AND (
            p.fechaFin IS NULL
            OR p.fechaFin >= :fecha
        )
        ORDER BY p.prioridad ASC
    """)
    List<Promocion> obtenerPromocionesActivas(LocalDate fecha);
}