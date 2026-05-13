package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.CartItemDTO;
import com.grupo_innovar.backend.model.CarritoItem;
import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.service.CarritoService;
import com.grupo_innovar.backend.service.UsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin
public class CartController {

    private final CarritoService carritoService;
    private final UsuarioService usuarioService;

    /* =====================================================
     * OBTENER USUARIO AUTENTICADO
     * ===================================================== */
    private Long obtenerUsuarioId(Principal principal) {

        Usuario usuario =
                usuarioService
                        .findByEmail(principal.getName())
                        .orElseThrow(() ->
                                new RuntimeException("Usuario no encontrado"));

        return usuario.getId();
    }

    /* =====================================================
     * OBTENER CARRITO
     * ===================================================== */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CarritoItem>> obtenerCarrito(
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        List<CarritoItem> carrito =
                carritoService.obtenerCarritoUsuario(usuarioId);

        return ResponseEntity.ok(carrito);
    }

    /* =====================================================
     * AGREGAR PRODUCTO
     * ===================================================== */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> agregarProducto(
            @RequestBody CartItemDTO dto,
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        carritoService.agregarProducto(
                usuarioId,
                dto.getProductoId(),
                dto.getCantidad()
        );

        return ResponseEntity.ok().build();
    }

    /* =====================================================
     * ACTUALIZAR CANTIDAD
     * ===================================================== */
    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarCantidad(
            @RequestBody CartItemDTO dto,
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        carritoService.actualizarCantidad(
                usuarioId,
                dto.getProductoId(),
                dto.getCantidad()
        );

        return ResponseEntity.ok().build();
    }

    /* =====================================================
     * ELIMINAR PRODUCTO
     * ===================================================== */
    @DeleteMapping("/remove/{productoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> eliminarProducto(
            @PathVariable Long productoId,
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        carritoService.eliminarProducto(
                usuarioId,
                productoId
        );

        return ResponseEntity.ok().build();
    }

    /* =====================================================
     * VACIAR CARRITO
     * ===================================================== */
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> vaciarCarrito(
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        carritoService.vaciarCarrito(usuarioId);

        return ResponseEntity.ok().build();
    }

    /* =====================================================
     * SINCRONIZAR CARRITO LOCAL
     * ===================================================== */
    @PostMapping("/sync")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sincronizarCarrito(
            @RequestBody List<CartItemDTO> items,
            Principal principal
    ) {

        Long usuarioId = obtenerUsuarioId(principal);

        carritoService.fusionarCarrito(
                usuarioId,
                items
        );

        return ResponseEntity.ok().build();
    }
}