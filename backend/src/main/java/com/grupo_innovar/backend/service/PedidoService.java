package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.CrearPedidoRequest;
import com.grupo_innovar.backend.dto.CrearPedidoResponseDTO;
import com.grupo_innovar.backend.dto.ItemPedidoRequest;
import com.grupo_innovar.backend.dto.WompiWidgetResponseDTO;
import com.grupo_innovar.backend.mapper.PedidoMapper;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.model.Pedido.EstadoPedido;
import com.grupo_innovar.backend.model.DetallePedido;
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.PedidoRepository;
import com.grupo_innovar.backend.repository.ProductoRepository;
import com.grupo_innovar.backend.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import java.time.LocalDateTime;

@Service
public class PedidoService {

    @Value("${wompi.public-key}")
    private String wompiPublicKey;

    @Value("${wompi.integrity-secret}")
    private String wompiIntegritySecret;

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ==============================
    // Crear Pedido
    // ==============================

    @Transactional
    public CrearPedidoResponseDTO crearPedido(CrearPedidoRequest request) {

        Pedido pedido = new Pedido();

        // Usuario autenticado
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }

        String email = auth.getName();

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        pedido.setUsuario(usuario);

        // IMPORTANTE: guardar datos cliente
        pedido.setEmailCliente(email);
        pedido.setNombreCliente(request.getNombre());
        pedido.setApellidoCliente(request.getApellido());
        pedido.setTelefonoCliente(request.getTelefono());

        // Dirección
        pedido.setDireccionEnvio(request.getDireccion());
        pedido.setCiudadEnvio(request.getCiudad());
        pedido.setDepartamentoEnvio(request.getDepartamento());
        pedido.setCodigoPostalEnvio(request.getCodigoPostal());

        // Pago
        pedido.setMetodoPago(Pedido.MetodoPago.valueOf(request.getMetodoPago()));
        pedido.setEstadoPedido(Pedido.EstadoPedido.PENDIENTE);

        // Cálculo
        BigDecimal subtotalCalculado = BigDecimal.ZERO;

        for (ItemPedidoRequest itemRequest : request.getItems()) {

            Producto producto = productoRepository.findById(itemRequest.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

            BigDecimal precioUnitario = producto.getPrecioPublico();
            BigDecimal subtotalItem = precioUnitario.multiply(
                    BigDecimal.valueOf(itemRequest.getCantidad())
            );

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(itemRequest.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotalItem);

            pedido.getDetalles().add(detalle);

            subtotalCalculado = subtotalCalculado.add(subtotalItem);
        }

        BigDecimal costoEnvio = request.getCostoEnvio() != null
                ? request.getCostoEnvio()
                : BigDecimal.ZERO;

        BigDecimal totalCalculado = subtotalCalculado.add(costoEnvio);

        pedido.setSubtotal(subtotalCalculado);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setTotal(totalCalculado);

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        return PedidoMapper.toDto(pedidoGuardado);
    }

    // ==============================
    // Obtener todos
    // ==============================

    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAll();
    }

    // ==============================
    // Obtener por ID
    // ==============================

    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con ID: " + id));
    }

    // ==============================
    // Actualizar Pedido
    // ==============================

    @Transactional
    public Pedido actualizarPedido(Long id, Pedido pedidoActualizado) {

        Pedido pedido = obtenerPorId(id);

        pedido.setEstadoPedido(pedidoActualizado.getEstadoPedido());
        pedido.setMetodoPago(pedidoActualizado.getMetodoPago());
        pedido.setDireccionEnvio(pedidoActualizado.getDireccionEnvio());
        pedido.setCiudadEnvio(pedidoActualizado.getCiudadEnvio());
        pedido.setDepartamentoEnvio(pedidoActualizado.getDepartamentoEnvio());
        pedido.setCodigoPostalEnvio(pedidoActualizado.getCodigoPostalEnvio());

        return pedidoRepository.save(pedido);
    }

    // ==============================
    // Eliminar
    // ==============================

    public void eliminarPedido(Long id) {
        Pedido pedido = obtenerPorId(id);
        pedidoRepository.delete(pedido);
    }

    // ==============================
    // Buscar por Email (usuario)
    // ==============================

    public List<CrearPedidoResponseDTO> obtenerPedidosPorEmail(String email) {

        List<Pedido> pedidos = pedidoRepository.findByUsuarioEmail(email);

        return pedidos.stream()
                .map(PedidoMapper::toDto)
                .toList();
    }

    // ==============================
    // Obtener detalle seguro
    // ==============================

    public CrearPedidoResponseDTO obtenerPedidoPorIdYEmail(Long id, String email) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getUsuario() == null ||
            !pedido.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para ver este pedido");
        }

        return PedidoMapper.toDto(pedido);
    }

    @Transactional
    public void actualizarEstado(
            Pedido pedido,
            EstadoPedido nuevoEstado
    ) {

        validarTransicion(
                pedido.getEstadoPedido(),
                nuevoEstado
        );

        switch (nuevoEstado) {

            case PENDIENTE -> {
                // Estado inicial
            }

            case PROCESANDO -> {
                if (pedido.getFechaProcesando() == null) {
                    pedido.setFechaProcesando(LocalDateTime.now());
                }
            }

            case ENVIADO -> {
                if (pedido.getFechaEnviado() == null) {
                    pedido.setFechaEnviado(LocalDateTime.now());
                }
            }

            case COMPLETADO -> {
                if (pedido.getFechaCompletado() == null) {
                    pedido.setFechaCompletado(LocalDateTime.now());
                }
            }

            case CANCELADO -> {
                pedido.setFechaCancelado(LocalDateTime.now());
            }
        }

        pedido.setEstadoPedido(nuevoEstado);

        pedidoRepository.save(pedido);
    }

    private void validarTransicion(
            Pedido.EstadoPedido actual,
            Pedido.EstadoPedido nuevo
    ) {

        if (actual == Pedido.EstadoPedido.CANCELADO) {
            throw new IllegalStateException(
                    "Un pedido cancelado no puede modificarse"
            );
        }

        if (actual == Pedido.EstadoPedido.COMPLETADO) {
            throw new IllegalStateException(
                    "Un pedido completado no puede modificarse"
            );
        }
    }

    public WompiWidgetResponseDTO generarWidgetWompi(Long pedidoId) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Long amountInCents = pedido.getTotal()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        String reference = pedido.getPago().getReferencia();

        String signature = generarFirmaIntegridad(
                reference,
                amountInCents,
                "COP"
        );

        WompiWidgetResponseDTO dto = new WompiWidgetResponseDTO();

        dto.setPublicKey(wompiPublicKey);
        dto.setReference(reference);
        dto.setAmountInCents(amountInCents);
        dto.setIntegritySignature(signature);

        return dto;
    }

    private String generarFirmaIntegridad(
            String reference,
            Long amountInCents,
            String currency) {

        try {

            String data = reference
                    + amountInCents
                    + currency
                    + wompiIntegritySecret;

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    data.getBytes(StandardCharsets.UTF_8)
            );

            StringBuilder hex = new StringBuilder();

            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error generando firma Wompi");
        }
    }
}