package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.util.Map;

public record PricingSnapshot(
        String pricingRequestId,
        String pricingQuoteId,
        String status,
        Map<String, String> quotedAmounts,
        Instant receivedAt,
        String correlationId) {
    public PricingSnapshot {
        quotedAmounts = Map.copyOf(quotedAmounts == null ? Map.of() : quotedAmounts);
        if (pricingQuoteId == null || pricingQuoteId.isBlank()) {
            throw new IllegalArgumentException("pricing quote id is required");
        }
    }
}
