package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.Booking;
import java.util.Arrays;

public record PricingAttempt(
        Booking booking,
        PricingInput input,
        byte[] canonicalBody,
        String inputHash,
        String providerKey,
        String correlationId) {
    public PricingAttempt {
        if (booking == null || input == null) {
            throw new IllegalArgumentException("booking and pricing input are required");
        }
        canonicalBody = Arrays.copyOf(canonicalBody, canonicalBody.length);
        if (!input.fingerprint().equals(inputHash) || !input.providerKey().equals(providerKey)) {
            throw new IllegalArgumentException("pricing attempt identity does not match canonical input");
        }
        if (correlationId == null || correlationId.isBlank()) {
            throw new IllegalArgumentException("correlation id is required");
        }
    }

    @Override
    public byte[] canonicalBody() {
        return Arrays.copyOf(canonicalBody, canonicalBody.length);
    }
}
