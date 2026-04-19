package com.grupo_innovar.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "usuarios",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_usuario_email",
        columnNames = "email"
    )
)
public class Usuario {

    /* ================= ENUMS ================= */

    public enum Rol {
        USUARIO,
        ADMIN
    }

    public enum TipoUsuario {
        PUBLICO,
        MAYORISTA
    }

    /* ================= ID ================= */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================= ESTADO ================= */

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private boolean invitado = false;

    /* ================= ROL (CRÍTICO) ================= */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol = Rol.USUARIO;

    /* ================= DATOS PERSONALES ================= */

    @Column(length = 80, nullable = false)
    private String nombre;

    @Column(length = 80)
    private String apellido;

    @Column(length = 150, nullable = false)
    private String email;

    @Column(name = "password_hash", length = 200)
    private String passwordHash;

    @Column(length = 30)
    private String telefono;

    /* ================= DIRECCIÓN ================= */

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String departamento;

    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;

    /* ================= TIPO USUARIO ================= */

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", length = 20, nullable = false)
    private TipoUsuario tipoUsuario = TipoUsuario.PUBLICO;

    /* ================= FECHA ================= */

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
    }

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    /* ================= GETTERS & SETTERS ================= */

    public Long getId() { return id; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public boolean isInvitado() { return invitado; }
    public void setInvitado(boolean invitado) { this.invitado = invitado; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }

    public LocalDateTime getUltimoLogin() { return ultimoLogin; }
    public void setUltimoLogin(LocalDateTime ultimoLogin) { this.ultimoLogin = ultimoLogin; }
}

