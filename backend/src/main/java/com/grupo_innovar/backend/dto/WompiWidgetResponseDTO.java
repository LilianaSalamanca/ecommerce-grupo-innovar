package com.grupo_innovar.backend.dto;

public class WompiWidgetResponseDTO {

    private String publicKey;
    private String reference;
    private Long amountInCents;
    private String integritySignature;

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Long getAmountInCents() {
        return amountInCents;
    }

    public void setAmountInCents(Long amountInCents) {
        this.amountInCents = amountInCents;
    }

    public String getIntegritySignature() {
        return integritySignature;
    }

    public void setIntegritySignature(String integritySignature) {
        this.integritySignature = integritySignature;
    }
}