package com.grupo_innovar.backend.mapper;

import com.grupo_innovar.backend.dto.PedidoDetalleDTO;
import com.grupo_innovar.backend.dto.CrearPedidoResponseDTO;
import com.grupo_innovar.backend.model.DetallePedido;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.model.Producto;

import java.util.List;
import java.util.stream.Collectors;

public final class PedidoMapper {

    private PedidoMapper() {}

    public static CrearPedidoResponseDTO toDto(Pedido p) {

        CrearPedidoResponseDTO dto = new CrearPedidoResponseDTO();

        dto.setId(p.getId());
        dto.setEstadoPedido(p.getEstadoPedido().name());
        dto.setMetodoPago(p.getMetodoPago().name());

        // CLIENTE
        dto.setNombreCliente(p.getNombreCliente());
        dto.setApellidoCliente(p.getApellidoCliente());
        dto.setEmailCliente(p.getEmailCliente());
        dto.setTelefonoCliente(p.getTelefonoCliente());

        // DIRECCIÓN
        dto.setDireccionEnvio(p.getDireccionEnvio());
        dto.setCiudadEnvio(p.getCiudadEnvio());
        dto.setDepartamentoEnvio(p.getDepartamentoEnvio());
        dto.setCodigoPostalEnvio(p.getCodigoPostalEnvio());

        // TOTALES
        dto.setSubtotal(p.getSubtotal());
        dto.setCostoEnvio(p.getCostoEnvio());
        dto.setTotal(p.getTotal());

        dto.setFechaCreacion(p.getFechaCreacion());

        // DETALLES
        List<PedidoDetalleDTO> dets = p.getDetalles()
                .stream()
                .map(PedidoMapper::toDetalleDto)
                .collect(Collectors.toList());

        dto.setDetalles(dets);

        // PAGO 🔥
        if (p.getPago() != null) {
            dto.setEstadoPago(p.getPago().getEstadoPago().name());
            dto.setMetodoPagoDetalle(p.getPago().getMetodoPago().name());
            dto.setReferenciaPago(p.getPago().getReferencia());
            dto.setCheckoutUrl(p.getPago().getCheckoutUrl());
        }

        return dto;
    }

    private static PedidoDetalleDTO toDetalleDto(DetallePedido d) {

        PedidoDetalleDTO dto = new PedidoDetalleDTO();

        Producto prod = d.getProducto();

        dto.setProductoId(prod.getId());
        dto.setNombreProducto(prod.getNombre());
        dto.setImagenDestacada(prod.getImagenDestacada());
        dto.setCantidad(d.getCantidad());
        dto.setPrecioUnitario(d.getPrecioUnitario());
        dto.setSubtotal(d.getSubtotal());

        return dto;
    }
}