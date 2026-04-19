package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.AdminPedidoResponse;
import com.grupo_innovar.backend.dto.AdminDetallePedido;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.model.DetallePedido;
import com.grupo_innovar.backend.model.Pago;
import com.grupo_innovar.backend.repository.PedidoRepository;
import com.grupo_innovar.backend.specification.PedidoSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class AdminPedidoService {

    private final PedidoRepository pedidoRepository;
    private final WalletService walletService;

    public AdminPedidoService(PedidoRepository pedidoRepository,
                              WalletService walletService) {
        this.pedidoRepository = pedidoRepository;
        this.walletService = walletService;
    }

    /* ===================================================== */
    /* ================= LISTAR PEDIDOS ===================== */
    /* ===================================================== */

    public Page<AdminPedidoResponse> listarPedidos(
            String email,
            String estado,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            Pageable pageable
    ) {
        return pedidoRepository
                .findAll(PedidoSpecification.conFiltros(email, estado, fechaInicio, fechaFin), pageable)
                .map(this::mapPedido);
    }

    private AdminPedidoResponse mapPedido(Pedido pedido){

        AdminPedidoResponse dto = new AdminPedidoResponse();

        dto.setId(pedido.getId());

        String nombre = pedido.getNombreCliente();
        String apellido = pedido.getApellidoCliente();
        String email = pedido.getEmailCliente();
        String telefono = pedido.getTelefonoCliente();

        if(pedido.getUsuario() != null){
            if(nombre == null || nombre.isBlank())
                nombre = pedido.getUsuario().getNombre();
            if(apellido == null || apellido.isBlank())
                apellido = pedido.getUsuario().getApellido();
            if(email == null || email.isBlank())
                email = pedido.getUsuario().getEmail();
            if(telefono == null || telefono.isBlank())
                telefono = pedido.getUsuario().getTelefono();

            dto.setUsuarioId(pedido.getUsuario().getId());
        }

        dto.setNombreCliente(nombre);
        dto.setApellidoCliente(apellido);
        dto.setEmailCliente(email);
        dto.setTelefonoCliente(telefono);

        dto.setDireccionEnvio(pedido.getDireccionEnvio());
        dto.setCiudadEnvio(pedido.getCiudadEnvio());
        dto.setDepartamentoEnvio(pedido.getDepartamentoEnvio());
        dto.setCodigoPostalEnvio(pedido.getCodigoPostalEnvio());

        dto.setSubtotal(pedido.getSubtotal());
        dto.setCostoEnvio(pedido.getCostoEnvio());
        dto.setTotal(pedido.getTotal());

        dto.setEstadoPedido(pedido.getEstadoPedido().name());
        dto.setMetodoPago(pedido.getMetodoPago().name());

        dto.setEstadoPago(
                pedido.getPago() != null
                        ? pedido.getPago().getEstadoPago().name()
                        : "PENDIENTE"
        );

        dto.setFechaCreacion(pedido.getFechaCreacion());
        dto.setFechaActualizacion(pedido.getFechaActualizacion());

        dto.setProductos(
                pedido.getDetalles() != null
                        ? pedido.getDetalles().stream().map(this::mapDetalle).toList()
                        : Collections.emptyList()
        );

        return dto;
    }

    private AdminDetallePedido mapDetalle(DetallePedido d){
        AdminDetallePedido dto = new AdminDetallePedido();

        if (d.getProducto() != null) {
            dto.setProductoId(d.getProducto().getId());
            dto.setNombreProducto(d.getProducto().getNombre());
            dto.setImagen(d.getProducto().getImagenDestacada());
        }

        dto.setCantidad(d.getCantidad());
        dto.setPrecioUnitario(d.getPrecioUnitario());
        dto.setSubtotal(d.getSubtotal());

        return dto;
    }

    /* ===================================================== */
    /* ============= CAMBIAR ESTADO PEDIDO ================== */
    /* ===================================================== */

    public void cambiarEstado(Long id, String estado) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        var estadoActual = pedido.getEstadoPedido();
        var nuevoEstado = Pedido.EstadoPedido.valueOf(estado);

        var pago = pedido.getPago();

        if (pago == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido sin pago");

        var estadoPago = pago.getEstadoPago();
        var metodo = pago.getMetodoPago();

        if (pedido.getUsuario() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido sin usuario");

        /* ================= BLOQUEO FINAL ================= */

        if (estadoActual == Pedido.EstadoPedido.COMPLETADO ||
            estadoActual == Pedido.EstadoPedido.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido finalizado");
        }

        /* ================= FLUJO ESTADOS ================= */

        boolean valido = switch (estadoActual) {
            case PENDIENTE -> nuevoEstado == Pedido.EstadoPedido.PROCESANDO || nuevoEstado == Pedido.EstadoPedido.CANCELADO;
            case PROCESANDO -> nuevoEstado == Pedido.EstadoPedido.ENVIADO || nuevoEstado == Pedido.EstadoPedido.CANCELADO;
            case ENVIADO -> nuevoEstado == Pedido.EstadoPedido.COMPLETADO;
            default -> false;
        };

        if (!valido)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transición inválida");

        /* ================= VALIDACIONES DE PAGO ================= */

        if (nuevoEstado == Pedido.EstadoPedido.PROCESANDO ||
            nuevoEstado == Pedido.EstadoPedido.ENVIADO) {

            if (metodo == Pago.MetodoPago.WOMPI &&
                estadoPago != Pago.EstadoPago.APROBADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "WOMPI debe estar APROBADO");
            }

            if (metodo == Pago.MetodoPago.CONTRA_ENTREGA &&
                estadoPago != Pago.EstadoPago.PENDIENTE &&
                estadoPago != Pago.EstadoPago.APROBADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contra entrega inválido");
            }
        }

        if (nuevoEstado == Pedido.EstadoPedido.COMPLETADO &&
            estadoPago != Pago.EstadoPago.APROBADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pago debe estar APROBADO");
        }

        /* ================= CANCELACIÓN ================= */

        if (nuevoEstado == Pedido.EstadoPedido.CANCELADO) {

            if (metodo == Pago.MetodoPago.CONTRA_ENTREGA) {
                pago.setEstadoPago(Pago.EstadoPago.CANCELADO);
            }

            if (metodo == Pago.MetodoPago.WOMPI) {

                if (estadoPago == Pago.EstadoPago.APROBADO) {

                    walletService.addCredit(
                            pedido.getUsuario().getId(),
                            pago.getMonto(),
                            pedido.getId(),
                            "Cancelación pedido"
                    );

                    pago.setEstadoPago(Pago.EstadoPago.EN_WALLET);

                } else {
                    pago.setEstadoPago(Pago.EstadoPago.CANCELADO);
                }
            }
        }

        pedido.setEstadoPedido(nuevoEstado);
        pedidoRepository.save(pedido);
    }

    /* ===================================================== */
    /* ============== CAMBIAR ESTADO PAGO =================== */
    /* ===================================================== */

    public void cambiarEstadoPago(Long pedidoId, String estadoStr) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        Pago pago = pedido.getPago();

        if (pago == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sin pago");

        var metodo = pago.getMetodoPago();
        var estadoPedido = pedido.getEstadoPedido();

        Pago.EstadoPago nuevoEstado = Pago.EstadoPago.valueOf(estadoStr);

        /* ================= BLOQUEOS ================= */

        if (estadoPedido == Pedido.EstadoPedido.COMPLETADO)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido completado");

        if (nuevoEstado == Pago.EstadoPago.EN_WALLET)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado automático");

        /* ================= WOMPI ================= */

        if (metodo == Pago.MetodoPago.WOMPI) {

            if (nuevoEstado == Pago.EstadoPago.RECHAZADO ||
                nuevoEstado == Pago.EstadoPago.PAGO_FALLIDO) {

                int intentos = pago.getIntentos() == null ? 0 : pago.getIntentos();
                intentos++;

                pago.setIntentos(intentos);

                if (intentos >= 3) {
                    pedido.setEstadoPedido(Pedido.EstadoPedido.CANCELADO);
                    pago.setEstadoPago(Pago.EstadoPago.CANCELADO);
                    pedidoRepository.save(pedido);
                    return;
                }

                pedido.setEstadoPedido(Pedido.EstadoPedido.PENDIENTE);
            }

            // ❌ IMPORTANTE: NO cambiar estado del pedido aquí
        }

        /* ================= CONTRA ENTREGA ================= */

        if (metodo == Pago.MetodoPago.CONTRA_ENTREGA) {

            if (nuevoEstado != Pago.EstadoPago.PENDIENTE &&
                nuevoEstado != Pago.EstadoPago.APROBADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido");
            }

        }

        pago.setEstadoPago(nuevoEstado);
        pedidoRepository.save(pedido);
    }
}