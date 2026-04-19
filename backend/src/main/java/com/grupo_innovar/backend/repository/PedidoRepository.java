package com.grupo_innovar.backend.repository;

import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long>, JpaSpecificationExecutor<Pedido> {

    /* ================= CONSULTAS BÁSICAS ================= */

    List<Pedido> findByUsuario(Usuario usuario);

    List<Pedido> findByEstadoPedido(Pedido.EstadoPedido estadoPedido);

    List<Pedido> findByUsuarioEmail(String email);

    /* ================= MÉTRICAS ================= */

    Long countByEstadoPedido(Pedido.EstadoPedido estadoPedido);

    // Ventas entre fechas (GENÉRICO)
    @Query("""
        SELECT COALESCE(SUM(p.total), 0)
        FROM Pedido p
        WHERE p.fechaCreacion BETWEEN :inicio AND :fin
    """)
    BigDecimal sumTotalByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}