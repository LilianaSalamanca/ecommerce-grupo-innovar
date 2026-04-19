package com.grupo_innovar.backend.dto;

public class DashboardMetricsResponse {

    private double ventasHoy;
    private double ventasMes;
    private int pedidosPendientes;
    private int totalPedidos;
    private int totalUsuarios;
    private int totalProductos;
    private double ticketPromedio;

    private int pedidosNuevos;
    private int productosSinStock;

    // GETTERS Y SETTERS

    public double getVentasHoy() { return ventasHoy; }
    public void setVentasHoy(double ventasHoy) { this.ventasHoy = ventasHoy; }

    public double getVentasMes() { return ventasMes; }
    public void setVentasMes(double ventasMes) { this.ventasMes = ventasMes; }

    public int getPedidosPendientes() { return pedidosPendientes; }
    public void setPedidosPendientes(int pedidosPendientes) { this.pedidosPendientes = pedidosPendientes; }

    public int getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(int totalPedidos) { this.totalPedidos = totalPedidos; }

    public int getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(int totalUsuarios) { this.totalUsuarios = totalUsuarios; }

    public int getTotalProductos() { return totalProductos; }
    public void setTotalProductos(int totalProductos) { this.totalProductos = totalProductos; }

    public double getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(double ticketPromedio) { this.ticketPromedio = ticketPromedio; }

    public int getPedidosNuevos() { return pedidosNuevos; }
    public void setPedidosNuevos(int pedidosNuevos) { this.pedidosNuevos = pedidosNuevos; }

    public int getProductosSinStock() { return productosSinStock; }
    public void setProductosSinStock(int productosSinStock) { this.productosSinStock = productosSinStock; }
}