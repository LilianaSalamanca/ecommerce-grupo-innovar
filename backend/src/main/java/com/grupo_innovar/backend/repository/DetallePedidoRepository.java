package com.grupo_innovar.backend.repository;

import com.grupo_innovar.backend.model.DetallePedido;
import com.grupo_innovar.backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    List<DetallePedido> findByPedido(Pedido pedido);
}
