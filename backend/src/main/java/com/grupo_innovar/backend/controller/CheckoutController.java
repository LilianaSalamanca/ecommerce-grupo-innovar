package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.CheckoutRequest;
import com.grupo_innovar.backend.dto.CheckoutResponse;
import com.grupo_innovar.backend.dto.CheckoutStatus;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.service.CheckoutService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    /**
     * Crear pedido (inicio de checkout)
     * Permite:
     * - Usuario autenticado
     * - Usuario invitado
     */
    @PostMapping
    public ResponseEntity<?> iniciarCheckout(
            @Valid @RequestBody CheckoutRequest req,
            Authentication authentication
    ) {

        CheckoutResponse resp = checkoutService.iniciarCheckout(req, authentication);

        // Si el servicio detecta que el email ya está registrado y no está logueado
        if (resp.getStatus() == CheckoutStatus.EMAIL_REGISTRADO) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
    }

        return ResponseEntity.ok(resp);
    }

    /**
     * Confirmar pago desde Wompi
     */
    public static record ConfirmRequest(
            Long pedidoId,
            String transactionId
    ) {}

    @PostMapping("/wompi/confirmar")
    public ResponseEntity<Pedido> confirmarPagoWompi(
            @RequestBody ConfirmRequest body
    ) {
        Pedido pedido = checkoutService.confirmarPagoWompi(
                body.pedidoId(),
                body.transactionId()
        );

        return ResponseEntity.ok(pedido);
    }
}
