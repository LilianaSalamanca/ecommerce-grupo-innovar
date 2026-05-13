package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.model.Promocion;
import com.grupo_innovar.backend.service.PromocionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@CrossOrigin(origins = "*")
public class PromocionController {

    private final PromocionService promocionService;

    public PromocionController(
            PromocionService promocionService
    ) {
        this.promocionService = promocionService;
    }

    @GetMapping
    public List<Promocion> listar() {
        return promocionService.listarTodas();
    }

    @GetMapping("/activas")
    public List<Promocion> listarActivas() {
        return promocionService.listarActivas();
    }

    @PostMapping
    public Promocion crear(
            @RequestBody Promocion promocion
    ) {
        return promocionService.crear(promocion);
    }

    @PutMapping("/{id}")
    public Promocion actualizar(
            @PathVariable Long id,
            @RequestBody Promocion promocion
    ) {
        return promocionService.actualizar(id, promocion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(
            @PathVariable Long id
    ) {
        promocionService.eliminar(id);
    }
}