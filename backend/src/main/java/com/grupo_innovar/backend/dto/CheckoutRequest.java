package com.grupo_innovar.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    // Datos de contacto/envío (usuario invitado o registrado)
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    @NotBlank
    private String direccion;
    @NotBlank
    private String ciudad;
    @NotBlank
    private String departamento;
    
    private String codigoPostal;  // opcional

    // Si el usuario ya existe, puede pasar userId (opcional)
    private Long usuarioId;

    // Método de pago seleccionado
    private String metodoPago; // WOMPI | CONTRA_ENTREGA

    // Items del carrito
    private List<ItemCheckout> items;

    // Total enviado por el frontend (se validará)
    private BigDecimal totalFront;

    // Getters/Setters
    // ----------------
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

    public Long getUsuarioId() { 
        return usuarioId; 
    }

    public void setUsuarioId(Long usuarioId) { 
        this.usuarioId = usuarioId; 
    }

    public String getMetodoPago() { 
        return metodoPago; 
    }

    public void setMetodoPago(String metodoPago) { 
        this.metodoPago = metodoPago; 
    }

    public List<ItemCheckout> getItems() { 
        return items; 
    }

    public void setItems(List<ItemCheckout> items) { 
        this.items = items; 
    }

    public BigDecimal getTotalFront() { 
        return totalFront; 
    }
    
    public void setTotalFront(BigDecimal totalFront) { 
        this.totalFront = totalFront; 
    }
}
