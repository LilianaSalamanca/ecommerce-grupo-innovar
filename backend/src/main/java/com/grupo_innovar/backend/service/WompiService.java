package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.Pago;
import com.grupo_innovar.backend.model.Pedido;
import com.grupo_innovar.backend.repository.PagoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Slf4j
@Service
public class WompiService {

    @Value("${wompi.public-key}")
    private String publicKey;

    @Value("${wompi.integrity-secret}")
    private String integritySecret;

    @Value("${wompi.url}")
    private String wompiEndpoint;

    @Value("${app.base-url}")
    private String baseUrl;

    private final PagoRepository pagoRepository;

    public WompiService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    @PostConstruct
    private void init() {
        log.info("WompiService iniciado correctamente (Sandbox)");
    }

    // ======================================================
    // PREPARAR PAGO WOMPI
    // ======================================================
    public Pago prepararPagoWompi(Pedido pedido) {

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMonto(
                pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO
        );
        pago.setMoneda("COP");
        pago.setEstadoPago(Pago.EstadoPago.PENDIENTE);
        pago.setMetodoPago(Pago.MetodoPago.WOMPI);

        // Referencia única (recomendado por Wompi)
        pago.setReferencia("PED-" + pedido.getId());

        // URL solo informativa (el widget se abre en frontend)
        pago.setCheckoutUrl(wompiEndpoint);

        log.info("Pago Wompi preparado para pedido {}", pedido.getId());

        return pagoRepository.save(pago);
    }

    // ======================================================
    // FIRMA DE INTEGRIDAD WOMPI (OFICIAL)
    // ======================================================
    public String generarFirma(long amountInCents, String currency, String reference) {
        try {

            String raw = amountInCents + currency.toLowerCase() + reference + integritySecret;

            // LOGS CRÍTICOS
            log.info("WOMPI RAW SIGNATURE STRING = [{}]", raw);
            log.info("WOMPI AMOUNT = {}", amountInCents);
            log.info("WOMPI CURRENCY = {}", currency);
            log.info("WOMPI REFERENCE = {}", reference);
            log.info("WOMPI INTEGRITY SECRET = {}", integritySecret);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

            String signature = HexFormat.of().formatHex(hash);

            log.info("WOMPI SIGNATURE = {}", signature);

            return signature;

        } catch (Exception e) {
            throw new RuntimeException("Error generando firma Wompi", e);
        }
    }

    // ======================================================
    // CONFIRMACIÓN (DEV / SANDBOX)
    // ======================================================
    public boolean confirmarPago(String transactionId) {
        // En sandbox basta con que exista
        return transactionId != null && !transactionId.isBlank();
    }

    // ======================================================
    // GETTERS
    // ======================================================
    public String getPublicKey() {
        return publicKey;
    }

    public String generarRedirectUrl() {
        return baseUrl + "/pago/wompi/retorno";
    }
}
