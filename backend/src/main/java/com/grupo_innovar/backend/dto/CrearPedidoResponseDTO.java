package com.grupo_innovar.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CrearPedidoResponseDTO {

    private Long id;

    private String estadoPedido;
    private String metodoPago;

    // ============================
    // DATOS DEL CLIENTE
    // ============================

    private String nombreCliente;
    private String apellidoCliente;
    private String emailCliente;
    private String telefonoCliente;

    // ============================
    // DIRECCIÓN DE ENVÍO
    // ============================

    private String direccionEnvio;
    private String ciudadEnvio;
    private String departamentoEnvio;
    private String codigoPostalEnvio;

    // ============================
    // TOTALES
    // ============================

    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private BigDecimal total;

    private LocalDateTime fechaCreacion;

    // ============================
    // PAGO (🔥 NUEVO)
    // ============================

    private String estadoPago;
    private String metodoPagoDetalle;
    private String referenciaPago;
    private String checkoutUrl;

    // ============================
    // PRODUCTOS DEL PEDIDO
    // ============================

    private List<PedidoDetalleDTO> detalles;

    // ============================
    // GETTERS Y SETTERS
    // ============================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEstadoPedido() { return estadoPedido; }
    public void setEstadoPedido(String estadoPedido) { this.estadoPedido = estadoPedido; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getApellidoCliente() { return apellidoCliente; }
    public void setApellidoCliente(String apellidoCliente) { this.apellidoCliente = apellidoCliente; }

    public String getEmailCliente() { return emailCliente; }
    public void setEmailCliente(String emailCliente) { this.emailCliente = emailCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }

    public String getCiudadEnvio() { return ciudadEnvio; }
    public void setCiudadEnvio(String ciudadEnvio) { this.ciudadEnvio = ciudadEnvio; }

    public String getDepartamentoEnvio() { return departamentoEnvio; }
    public void setDepartamentoEnvio(String departamentoEnvio) { this.departamentoEnvio = departamentoEnvio; }

    public String getCodigoPostalEnvio() { return codigoPostalEnvio; }
    public void setCodigoPostalEnvio(String codigoPostalEnvio) { this.codigoPostalEnvio = codigoPostalEnvio; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<PedidoDetalleDTO> getDetalles() { return detalles; }
    public void setDetalles(List<PedidoDetalleDTO> detalles) { this.detalles = detalles; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public String getMetodoPagoDetalle() { return metodoPagoDetalle; }
    public void setMetodoPagoDetalle(String metodoPagoDetalle) { this.metodoPagoDetalle = metodoPagoDetalle; }

    public String getReferenciaPago() { return referenciaPago; }
    public void setReferenciaPago(String referenciaPago) { this.referenciaPago = referenciaPago; }

    public String getCheckoutUrl() { return checkoutUrl; }
    public void setCheckoutUrl(String checkoutUrl) { this.checkoutUrl = checkoutUrl; }
}