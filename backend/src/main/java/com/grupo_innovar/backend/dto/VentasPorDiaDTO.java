package com.grupo_innovar.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class VentasPorDiaDTO {

    private LocalDate fecha;
    private BigDecimal total;

    public VentasPorDiaDTO(LocalDate fecha, BigDecimal total) {
        this.fecha = fecha;
        this.total = total;
    }

    public LocalDate getFecha() { return fecha; }
    public BigDecimal getTotal() { return total; }
}
