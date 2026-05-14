package com.grupo_innovar.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "pedidos")
public class Pedido {

    /* ================= ENUMS ================= */

    public enum EstadoPedido {
        PENDIENTE,
        PROCESANDO,
        ENVIADO,
        COMPLETADO,
        CANCELADO
    }

    public enum MetodoPago {
        WOMPI,
        CONTRA_ENTREGA
    }

    /* ================= ID ================= */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================= USUARIO ================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id",
            foreignKey = @ForeignKey(name = "fk_pedido_usuario"))
    @JsonIgnore
    private Usuario usuario;

    /* ================= DATOS CLIENTE ================= */

    @Column(name = "nombre_cliente", nullable = false, length = 100)
    private String nombreCliente;

    @Column(name = "apellido_cliente", nullable = false, length = 100)
    private String apellidoCliente;

    @Column(name = "email_cliente", nullable = false, length = 150)
    private String emailCliente;

    @Column(name = "telefono_cliente", length = 50)
    private String telefonoCliente;

    /* ================= DIRECCIÓN ================= */

    @Column(nullable = false, length = 200)
    private String direccionEnvio;

    @Column(nullable = false, length = 100)
    private String ciudadEnvio;

    @Column(nullable = false, length = 100)
    private String departamentoEnvio;

    @Column(length = 20)
    private String codigoPostalEnvio;

    /* ================= TOTALES ================= */

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDescuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    /* ================= ESTADO ================= */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estadoPedido = EstadoPedido.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodoPago = MetodoPago.CONTRA_ENTREGA;

    /* ================= DETALLES ================= */

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DetallePedido> detalles = new ArrayList<>();

    /* ================= PAGO ================= */

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Pago pago;

    /* ================= FECHAS ================= */

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column
    private LocalDateTime fechaProcesando;

    @Column
    private LocalDateTime fechaEnviado;

    @Column
    private LocalDateTime fechaCompletado;

    @Column
    private LocalDateTime fechaCancelado;

    /* ================= LIFECYCLE ================= */

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.fechaCreacion = now;
        this.fechaActualizacion = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    /* ================= MÉTODOS ================= */

    public void addDetalle(DetallePedido detalle) {
        this.detalles.add(detalle);
        detalle.setPedido(this);
    }

    public void removeDetalle(DetallePedido detalle) {
        this.detalles.remove(detalle);
        detalle.setPedido(null);
    }

    public void calcularTotal() {
        this.total = subtotal
                .add(costoEnvio)
                .subtract(totalDescuento);
    }

    /* ================= GETTERS ================= */

    public Long getId() { return id; }

    public Usuario getUsuario() { return usuario; }

    public String getNombreCliente() { return nombreCliente; }

    public String getApellidoCliente() { return apellidoCliente; }

    public String getEmailCliente() { return emailCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }

    public String getDireccionEnvio() { return direccionEnvio; }

    public String getCiudadEnvio() { return ciudadEnvio; }

    public String getDepartamentoEnvio() { return departamentoEnvio; }

    public String getCodigoPostalEnvio() { return codigoPostalEnvio; }

    public BigDecimal getSubtotal() { return subtotal; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }

    public BigDecimal getTotalDescuento() { return totalDescuento; }

    public BigDecimal getTotal() { return total; }

    public EstadoPedido getEstadoPedido() { return estadoPedido; }

    public MetodoPago getMetodoPago() { return metodoPago; }

    public List<DetallePedido> getDetalles() { return detalles; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }

    public Pago getPago() { return pago; }

    public LocalDateTime getFechaProcesando() {
        return fechaProcesando;
    }

    public LocalDateTime getFechaEnviado() {
        return fechaEnviado;
    }

    public LocalDateTime getFechaCompletado() {
        return fechaCompletado;
    }

    public LocalDateTime getFechaCancelado() {
        return fechaCancelado;
    }

    /* ================= SETTERS ================= */

    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public void setApellidoCliente(String apellidoCliente) { this.apellidoCliente = apellidoCliente; }

    public void setEmailCliente(String emailCliente) { this.emailCliente = emailCliente; }

    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }

    public void setCiudadEnvio(String ciudadEnvio) { this.ciudadEnvio = ciudadEnvio; }

    public void setDepartamentoEnvio(String departamentoEnvio) { this.departamentoEnvio = departamentoEnvio; }

    public void setCodigoPostalEnvio(String codigoPostalEnvio) { this.codigoPostalEnvio = codigoPostalEnvio; }

    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public void setTotalDescuento(BigDecimal totalDescuento) { this.totalDescuento = totalDescuento; }

    public void setTotal(BigDecimal total) { this.total = total; }

    public void setEstadoPedido(EstadoPedido estadoPedido) { this.estadoPedido = estadoPedido; }

    public void setMetodoPago(MetodoPago metodoPago) { this.metodoPago = metodoPago; }

    public void setPago(Pago pago) {
        this.pago = pago;
        if (pago != null) {
            pago.setPedido(this);
        }
    }

    public void setFechaProcesando(LocalDateTime fechaProcesando) {
        this.fechaProcesando = fechaProcesando;
    }

    public void setFechaEnviado(LocalDateTime fechaEnviado) {
        this.fechaEnviado = fechaEnviado;
    }

    public void setFechaCompletado(LocalDateTime fechaCompletado) {
        this.fechaCompletado = fechaCompletado;
    }

    public void setFechaCancelado(LocalDateTime fechaCancelado) {
        this.fechaCancelado = fechaCancelado;
    }
}