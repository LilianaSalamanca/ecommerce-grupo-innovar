package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.CartItemDTO;
import com.grupo_innovar.backend.model.CarritoItem;
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.CarritoRepository;
import com.grupo_innovar.backend.repository.ProductoRepository;
import com.grupo_innovar.backend.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    /* =====================================================
     * OBTENER CARRITO DEL USUARIO
     * ===================================================== */
    @Transactional(readOnly = true)
    public List<CarritoItem> obtenerCarritoUsuario(Long usuarioId) {

        return carritoRepository.findByUsuarioId(usuarioId);
    }

    /* =====================================================
     * AGREGAR PRODUCTO
     * ===================================================== */
    public void agregarProducto(
            Long usuarioId,
            Long productoId,
            Integer cantidad
    ) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Producto no encontrado"));

        CarritoItem itemExistente =
                carritoRepository
                        .findByUsuarioIdAndProductoId(usuarioId, productoId)
                        .orElse(null);

        // SI YA EXISTE → SUMAR CANTIDAD
        if (itemExistente != null) {

            itemExistente.setCantidad(
                    itemExistente.getCantidad() + cantidad
            );

            carritoRepository.save(itemExistente);

            return;
        }

        // NUEVO ITEM
        CarritoItem item = CarritoItem.builder()
                .usuario(usuario)
                .producto(producto)
                .cantidad(cantidad)
                .build();

        carritoRepository.save(item);
    }

    /* =====================================================
     * ACTUALIZAR CANTIDAD
     * ===================================================== */
    public void actualizarCantidad(
            Long usuarioId,
            Long productoId,
            Integer cantidad
    ) {

        CarritoItem item =
                carritoRepository
                        .findByUsuarioIdAndProductoId(usuarioId, productoId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Producto no encontrado en carrito"
                                ));

        item.setCantidad(cantidad);

        carritoRepository.save(item);
    }

    /* =====================================================
     * ELIMINAR PRODUCTO
     * ===================================================== */
    public void eliminarProducto( Long usuarioId, Long productoId ) {

        CarritoItem item =
                carritoRepository
                        .findByUsuarioIdAndProductoId(usuarioId, productoId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Producto no encontrado en carrito"
                                ));

        carritoRepository.delete(item);
    }

    /* =====================================================
     * VACIAR CARRITO
     * ===================================================== */
    public void vaciarCarrito(Long usuarioId) {

        carritoRepository.deleteByUsuarioId(usuarioId);
    }

    /* =====================================================
     * FUSIONAR CARRITO LOCAL + SERVIDOR
     * ===================================================== */
    public void fusionarCarrito(Long usuarioId, List<CartItemDTO> items) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Usuario no encontrado"));

        for (CartItemDTO dto : items) {

                Producto producto = productoRepository.findById(dto.getProductoId())
                        .orElseThrow(() ->
                                new EntityNotFoundException("Producto no encontrado"));

                CarritoItem existente =
                        carritoRepository.findByUsuarioIdAndProductoId(
                                usuarioId,
                                dto.getProductoId()
                        ).orElse(null);

                if (existente != null) {

                existente.setCantidad(
                        existente.getCantidad() + dto.getCantidad()
                );

                carritoRepository.save(existente);

                } else {

                CarritoItem nuevo = CarritoItem.builder()
                        .usuario(usuario)
                        .producto(producto)
                        .cantidad(dto.getCantidad())
                        .build();

                carritoRepository.save(nuevo);
                }
        }
    }
}