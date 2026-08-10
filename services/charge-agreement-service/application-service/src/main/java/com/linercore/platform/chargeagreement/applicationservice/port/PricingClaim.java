package com.linercore.platform.chargeagreement.applicationservice.port;

import java.util.Objects;

public record PricingClaim(
        String idempotencyKey,
        String bookingRef,
        int amendmentSeq,
        String requestHash,
        String ownerToken,
        String correlationId) {

    public PricingClaim {
        idempotencyKey = required(idempotencyKey, "idempotency key", 160);
        bookingRef = required(bookingRef, "booking reference", 128);
        if (amendmentSeq < 0) {
            throw new IllegalArgumentException("amendment sequence must not be negative");
        }
        requestHash = required(requestHash, "request hash", 64);
        if (!requestHash.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException("request hash must be lowercase SHA-256");
        }
        ownerToken = required(ownerToken, "owner token", 128);
        correlationId = required(correlationId, "correlation ID", 128);
    }

    private static String required(String value, String field, int maxLength) {
        String normalized = Objects.requireNonNull(value, field + " is required").trim();
        if (normalized.isEmpty() || normalized.length() > maxLength) {
            throw new IllegalArgumentException(field + " is invalid");
        }
        return normalized;
    }
}
