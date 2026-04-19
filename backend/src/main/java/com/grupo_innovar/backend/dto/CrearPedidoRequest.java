package com.grupo_innovar.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class CrearPedidoRequest {

    // =============================
    // Datos del Cliente
    // =============================

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    // Si viene JWT, el backend lo toma del SecurityContext
    // Este campo es opcional para invitados
    private Long usuarioId;

    // =============================
    // Dirección de Envío
    // =============================

    private String direccion;
    private String ciudad;
    private String departamento;
    private String codigoPostal;
    private String pais;

    // =============================
    // Información del Pedido
    // =============================

    private List<ItemPedidoRequest> items;

    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private BigDecimal total;

    // =============================
    // Método de Pago
    // =============================

    private String metodoPago; 
    // Ej: "WOMPI", "TRANSFERENCIA", "CONTRA_ENTREGA"

    private String referenciaPago; 
    // Se llena cuando Wompi devuelve referencia

    // =============================
    // Opcional: creación de cuenta
    // =============================

    private Boolean deseaCrearCuenta;

    private String password; 
    // Solo si deseaCrearCuenta = true


    // =============================
    // Getters y Setters
    // =============================

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public List<ItemPedidoRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemPedidoRequest> items) {
        this.items = items;
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

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getReferenciaPago() {
        return referenciaPago;
    }

    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }

    public Boolean getDeseaCrearCuenta() {
        return deseaCrearCuenta;
    }

    public void setDeseaCrearCuenta(Boolean deseaCrearCuenta) {
        this.deseaCrearCuenta = deseaCrearCuenta;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
