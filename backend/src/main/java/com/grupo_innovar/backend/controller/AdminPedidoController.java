package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.AdminPedidoResponse;
import com.grupo_innovar.backend.service.AdminPedidoService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/pedidos")
public class AdminPedidoController {

    private final AdminPedidoService adminPedidoService;

    public AdminPedidoController(AdminPedidoService adminPedidoService) {
        this.adminPedidoService = adminPedidoService;
    }

    @GetMapping
    public Page<AdminPedidoResponse> listar(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaInicio,
            Pageable pageable
    ) {

        LocalDateTime inicio = null;
        LocalDateTime fin = null;

        // Convertir correctamente fechas (IMPORTANTE)
        if (fechaInicio != null && !fechaInicio.isBlank()) {
            inicio = LocalDate.parse(fechaInicio).atStartOfDay();
        }

        return adminPedidoService.listarPedidos(email, estado, inicio, fin, pageable);
    }

    @PutMapping("/{id}/estado")
    public void cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado
    ) {
        adminPedidoService.cambiarEstado(id, estado);
    }

    @PutMapping("/{id}/estado-pago")
    public void cambiarEstadoPago(
            @PathVariable Long id,
            @RequestParam String estado
    ) {
        adminPedidoService.cambiarEstadoPago(id, estado);
    }
}