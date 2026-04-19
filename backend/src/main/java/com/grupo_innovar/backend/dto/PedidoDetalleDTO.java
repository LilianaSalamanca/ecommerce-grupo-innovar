package com.grupo_innovar.backend.dto;

import java.math.BigDecimal;

public class PedidoDetalleDTO {

    private Long productoId;
    private String nombreProducto;
    private String imagenDestacada;
    private int cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

    // ============================
    // GETTERS Y SETTERS
    // ============================

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public String getImagenDestacada() { return imagenDestacada; }
    public void setImagenDestacada(String imagenDestacada) { this.imagenDestacada = imagenDestacada; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}