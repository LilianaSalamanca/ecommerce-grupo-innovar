package com.grupo_innovar.backend.dto;

import java.util.List;

import java.math.BigDecimal;

public class CheckoutResponse {

    private Long pedidoId;
    private BigDecimal total;
    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private String estadoPedido;
    private String metodoPago;
    private String fechaCreacion;
    private String wompiUrl;
    private String wompiPublicKey;
    private Long amountInCents;
    private String integritySignature;
    private String reference;
    private CheckoutStatus status;

    private List<CheckoutItemResponse> items;

    // --- Getters y Setters ---
    public Long getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getCostoEnvio() {
        return costoEnvio;
    }

    public void setCostoEnvio(BigDecimal costoEnvio) {
        this.costoEnvio = costoEnvio;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getWompiUrl() {
        return wompiUrl;
    }

    public void setWompiUrl(String wompiUrl) {
        this.wompiUrl = wompiUrl;
    }

    public String getWompiPublicKey() {
        return wompiPublicKey;
    }

    public void setWompiPublicKey(String wompiPublicKey) {
        this.wompiPublicKey = wompiPublicKey;
    }

    public Long getAmountInCents() {
        return amountInCents;
    }

    public void setAmountInCents(Long amountInCents) {
        this.amountInCents = amountInCents;
    }

    public String getIntegritySignature() {
        return integritySignature;
    }

    public void setIntegritySignature(String integritySignature) {
        this.integritySignature = integritySignature;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public List<CheckoutItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItemResponse> items) {
        this.items = items;
    }

    public CheckoutStatus getStatus() {
        return status;
    }

    public void setStatus(CheckoutStatus status) {
        this.status = status;
    }

}
