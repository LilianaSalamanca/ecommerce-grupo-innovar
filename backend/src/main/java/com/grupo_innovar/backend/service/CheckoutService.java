package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.*;
import com.grupo_innovar.backend.model.*;
import com.grupo_innovar.backend.model.Pago.EstadoPago;
import com.grupo_innovar.backend.model.Pedido.EstadoPedido;
import com.grupo_innovar.backend.model.Pedido.MetodoPago;
import com.grupo_innovar.backend.repository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CheckoutService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PagoRepository pagoRepository;
    private final WompiService wompiService;

    @Value("${app.base-url}")
    private String baseUrl;

    public CheckoutService(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            PagoRepository pagoRepository,
            WompiService wompiService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.pagoRepository = pagoRepository;
        this.wompiService = wompiService;
    }

    // ======================================================
    // INICIAR CHECKOUT
    // ======================================================

    @Transactional
    public CheckoutResponse iniciarCheckout(
            CheckoutRequest req,
            Authentication authentication
    ) {

        CheckoutResponse resp = new CheckoutResponse();

        boolean usuarioLogueado =
                authentication != null &&
                authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal());

        // Validar email invitado ya registrado
        if (!usuarioLogueado) {

            if (usuarioRepository.existsByEmail(req.getEmail())) {
                resp.setStatus(CheckoutStatus.EMAIL_REGISTRADO);
                return resp;
            }

        }

        Pedido pedido = procesarCheckout(req, authentication);
        Pago pago = pedido.getPago();

        long amountInCents = pedido.getTotal()
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        String reference = pago.getReferencia();

        String integrity = wompiService.generarFirma(
                amountInCents,
                "COP",
                reference
        );

        resp.setStatus(CheckoutStatus.OK);
        resp.setPedidoId(pedido.getId());
        resp.setSubtotal(pedido.getSubtotal());
        resp.setCostoEnvio(pedido.getCostoEnvio());
        resp.setTotal(pedido.getTotal());
        resp.setEstadoPedido(pedido.getEstadoPedido().name());
        resp.setMetodoPago(pedido.getMetodoPago().name());
        resp.setFechaCreacion(pedido.getFechaCreacion().toString());
        resp.setAmountInCents(amountInCents);
        resp.setReference(reference);
        resp.setIntegritySignature(integrity);

        if (pedido.getMetodoPago() == MetodoPago.WOMPI) {
            resp.setWompiUrl(pago.getCheckoutUrl());
            resp.setWompiPublicKey(wompiService.getPublicKey());
        }

        resp.setItems(
                pedido.getDetalles().stream().map(d -> {

                    CheckoutItemResponse item = new CheckoutItemResponse();
                    item.setProductoId(d.getProducto().getId());
                    item.setNombre(d.getProducto().getNombre());
                    item.setCantidad(d.getCantidad());
                    item.setPrecioUnitario(d.getPrecioUnitario());
                    item.setSubtotal(d.getSubtotal());

                    return item;

                }).toList()
        );

        return resp;
    }

    // ======================================================
    // PROCESAR CHECKOUT
    // ======================================================

    @Transactional
    public Pedido procesarCheckout(
            CheckoutRequest req,
            Authentication authentication
    ) {

        Usuario usuario = obtenerUsuarioCheckout(req, authentication);

        MetodoPago metodo = MetodoPago.CONTRA_ENTREGA;

        if (req.getMetodoPago() != null) {

            try {
                metodo = MetodoPago.valueOf(req.getMetodoPago().toUpperCase());
            } catch (Exception ignored) {}

        }

        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (ItemCheckout item : req.getItems()) {

            Producto prod = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Producto no encontrado"));

            int cant = Math.max(item.getCantidad(), 1);

            BigDecimal precio = cant >= 5
                    ? prod.getPrecioMayorista()
                    : prod.getPrecioPublico();

            BigDecimal totalLinea = precio.multiply(BigDecimal.valueOf(cant));

            subtotal = subtotal.add(totalLinea);

            DetallePedido d = new DetallePedido();
            d.setProducto(prod);
            d.setCantidad(cant);
            d.setPrecioUnitario(precio);
            d.setSubtotal(totalLinea);

            detalles.add(d);
        }

        BigDecimal envio = calcularEnvio(subtotal, detalles);
        BigDecimal total = subtotal.add(envio);

        // VALIDACIÓN CONTRA FRONT
        if (req.getTotalFront() != null &&
            total.compareTo(req.getTotalFront()) != 0) {

            throw new IllegalArgumentException("El total no coincide con el servidor");
        }

        Pedido pedido = new Pedido();

        pedido.setUsuario(usuario);

        // SNAPSHOT DE CLIENTE (muy importante)
        String nombre = req.getNombre();
        String apellido = req.getApellido();
        String email = req.getEmail();
        String telefono = req.getTelefono();

        if (usuario != null) {

            if (nombre == null) nombre = usuario.getNombre();
            if (apellido == null) apellido = usuario.getApellido();
            if (email == null) email = usuario.getEmail();
            if (telefono == null) telefono = usuario.getTelefono();

        }

        pedido.setNombreCliente(nombre);
        pedido.setApellidoCliente(apellido);
        pedido.setEmailCliente(email);
        pedido.setTelefonoCliente(telefono);

        pedido.setDireccionEnvio(req.getDireccion());
        pedido.setCiudadEnvio(req.getCiudad());
        pedido.setDepartamentoEnvio(req.getDepartamento());
        pedido.setCodigoPostalEnvio(req.getCodigoPostal());

        pedido.setSubtotal(subtotal);
        pedido.setCostoEnvio(envio);
        pedido.setTotal(total);
        pedido.setMetodoPago(metodo);
        pedido.setEstadoPedido(EstadoPedido.PENDIENTE);

        detalles.forEach(pedido::addDetalle);

        pedido = pedidoRepository.save(pedido);

        Pago pago;

        if (metodo == MetodoPago.WOMPI) {

            pago = wompiService.prepararPagoWompi(pedido);

        } else {

            pago = new Pago();

            pago.setPedido(pedido);
            pago.setMonto(total);
            pago.setMoneda("COP");
            pago.setEstadoPago(EstadoPago.PENDIENTE);
            pago.setMetodoPago(Pago.MetodoPago.CONTRA_ENTREGA);

            pagoRepository.save(pago);

        }

        pedido.setPago(pago);

        return pedido;
    }

    // ======================================================
    // OBTENER USUARIO
    // ======================================================

    private Usuario obtenerUsuarioCheckout(
            CheckoutRequest req,
            Authentication authentication
    ) {

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            String emailAuth = authentication.getName();

            return usuarioRepository.findByEmail(emailAuth)
                    .orElseThrow(() ->
                            new RuntimeException("Usuario autenticado no encontrado"));
        }

        // usuario invitado

        Usuario invitado = new Usuario();

        invitado.setNombre(req.getNombre());
        invitado.setApellido(req.getApellido());
        invitado.setEmail(req.getEmail());
        invitado.setTelefono(req.getTelefono());
        invitado.setDireccion(req.getDireccion());
        invitado.setCiudad(req.getCiudad());
        invitado.setDepartamento(req.getDepartamento());
        invitado.setCodigoPostal(req.getCodigoPostal());

        invitado.setInvitado(true);
        invitado.setActivo(true);
        invitado.setTipoUsuario(Usuario.TipoUsuario.PUBLICO);

        return usuarioRepository.save(invitado);
    }

    // ======================================================
    // CONFIRMAR PAGO WOMPI
    // ======================================================

    @Transactional
    public Pedido confirmarPagoWompi(Long pedidoId, String transactionId) {

        Pago pago = pagoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Pago no encontrado"));

        boolean aprobado = wompiService.confirmarPago(transactionId);

        Pedido pedido = pago.getPedido();

        if (aprobado) {

            pago.setEstadoPago(EstadoPago.APROBADO);
            pedido.setEstadoPedido(EstadoPedido.COMPLETADO);

        } else {

            pago.setEstadoPago(EstadoPago.RECHAZADO);
            pedido.setEstadoPedido(EstadoPedido.CANCELADO);

        }

        return pedido;
    }

    // ======================================================

    private BigDecimal calcularEnvio(BigDecimal subtotal, List<DetallePedido> detalles) {

        boolean tieneMayorista = detalles.stream()
                .anyMatch(d -> d.getCantidad() >= 5);

        // Si NO es mayorista → envío GRATIS
        if (!tieneMayorista) {
            return BigDecimal.ZERO;
        }

        // Si es mayorista y supera 600k → envío GRATIS
        if (subtotal.compareTo(new BigDecimal("600000")) >= 0) {
            return BigDecimal.ZERO;
        }

        // Caso restante → se cobra envío
        return new BigDecimal("15000");
        }

}