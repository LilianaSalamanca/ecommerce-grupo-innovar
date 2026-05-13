package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.Promocion;
import com.grupo_innovar.backend.repository.PromocionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PromocionService {

    private final PromocionRepository promocionRepository;

    public PromocionService(
            PromocionRepository promocionRepository
    ) {
        this.promocionRepository = promocionRepository;
    }

    public List<Promocion> listarTodas() {
        return promocionRepository.findAll();
    }

    public List<Promocion> listarActivas() {
        return promocionRepository
                .obtenerPromocionesActivas(LocalDate.now());
    }

    public Promocion crear(Promocion promocion) {
        return promocionRepository.save(promocion);
    }

    public Promocion actualizar(Long id, Promocion data) {

        Promocion promocion = promocionRepository
                .findById(id)
                .orElseThrow();

        promocion.setTitulo(data.getTitulo());
        promocion.setDescripcion(data.getDescripcion());
        promocion.setImagen(data.getImagen());
        promocion.setBotonTexto(data.getBotonTexto());
        promocion.setEnlace(data.getEnlace());
        promocion.setActiva(data.getActiva());
        promocion.setPrioridad(data.getPrioridad());
        promocion.setFechaInicio(data.getFechaInicio());
        promocion.setFechaFin(data.getFechaFin());

        return promocionRepository.save(promocion);
    }

    public void eliminar(Long id) {
        promocionRepository.deleteById(id);
    }
}