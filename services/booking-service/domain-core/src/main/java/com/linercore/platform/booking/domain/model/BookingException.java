package com.linercore.platform.booking.domain.model;

import java.time.Instant;

public record BookingException(
        String code,
        String message,
        String correlationId,
        Instant occurredAt) {
    public BookingException {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("exception code is required");
        }
    }
}
