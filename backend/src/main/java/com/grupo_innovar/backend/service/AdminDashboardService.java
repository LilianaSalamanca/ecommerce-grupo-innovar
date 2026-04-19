package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.DashboardMetricsResponse;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.repository.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AdminDashboardService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AdminDashboardService(PedidoRepository pedidoRepository,
                                 ProductoRepository productoRepository,
                                 UsuarioRepository usuarioRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public DashboardMetricsResponse obtenerMetricas() {

        DashboardMetricsResponse res = new DashboardMetricsResponse();

        // ================= TOTALES =================
        res.setTotalPedidos((int) pedidoRepository.count());

        res.setPedidosPendientes(
                pedidoRepository.countByEstadoPedido(Pedido.EstadoPedido.PENDIENTE).intValue()
        );

        res.setTotalUsuarios((int) usuarioRepository.count());
        res.setTotalProductos((int) productoRepository.count());

        res.setProductosSinStock(productoRepository.countByStock(0));

        // ================= FECHAS =================

        LocalDateTime inicioHoy = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime finHoy = inicioHoy.plusDays(1);

        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime finMes = inicioMes.plusMonths(1);

        BigDecimal ventasHoy = pedidoRepository.sumTotalByFechaBetween(inicioHoy, finHoy);
        BigDecimal ventasMes = pedidoRepository.sumTotalByFechaBetween(inicioMes, finMes);

        res.setVentasHoy(ventasHoy.doubleValue());
        res.setVentasMes(ventasMes.doubleValue());

        // ================= TICKET =================
        res.setTicketPromedio(
                res.getTotalPedidos() > 0
                        ? res.getVentasMes() / res.getTotalPedidos()
                        : 0
        );

        return res;
    }

    // 🔥 TIEMPO REAL
    @Scheduled(fixedRate = 5000)
    public void enviarMetricasTiempoReal() {
        DashboardMetricsResponse metrics = obtenerMetricas();

        System.out.println("Enviando métricas en tiempo real...");

        messagingTemplate.convertAndSend("/topic/dashboard", metrics);
    }
}