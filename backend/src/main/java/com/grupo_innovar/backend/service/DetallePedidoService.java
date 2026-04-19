package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.DetallePedido;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.repository.DetallePedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DetallePedidoService {

    private final DetallePedidoRepository detallePedidoRepository;

    public DetallePedidoService(DetallePedidoRepository detallePedidoRepository) {
        this.detallePedidoRepository = detallePedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<DetallePedido> obtenerPorPedido(Pedido pedido) {
        return detallePedidoRepository.findByPedido(pedido);
    }
}