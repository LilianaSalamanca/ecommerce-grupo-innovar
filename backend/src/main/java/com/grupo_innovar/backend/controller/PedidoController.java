package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.CrearPedidoRequest;
import com.grupo_innovar.backend.dto.CrearPedidoResponseDTO;
import com.grupo_innovar.backend.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<CrearPedidoResponseDTO> crearPedido(
            @RequestBody CrearPedidoRequest request) {

        CrearPedidoResponseDTO response = pedidoService.crearPedido(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<?> obtenerMisPedidos(Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
            pedidoService.obtenerPedidosPorEmail(email)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPedido(@PathVariable Long id, Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
            pedidoService.obtenerPedidoPorIdYEmail(id, email)
        );
    }
}
