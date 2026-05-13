package com.grupo_innovar.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grupo_innovar.backend.model.CarritoItem;

@Repository
public interface CarritoRepository
        extends JpaRepository<CarritoItem, Long> {

    List<CarritoItem> findByUsuarioId(Long usuarioId);

    Optional<CarritoItem> findByUsuarioIdAndProductoId(
            Long usuarioId,
            Long productoId
    );

    void deleteByUsuarioId(Long usuarioId);
}