package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.util.Map;

public record LegacyPricingSnapshot(
        String pricingRequestId,
        String pricingQuoteId,
        String status,
        Map<String, String> quotedAmounts,
        Instant receivedAt,
        String correlationId) {
    public LegacyPricingSnapshot {
        if (pricingQuoteId == null || pricingQuoteId.isBlank()) {
            throw new IllegalArgumentException("legacy pricing quote id is required");
        }
        quotedAmounts = Map.copyOf(quotedAmounts == null ? Map.of() : quotedAmounts);
    }

    public static LegacyPricingSnapshot from(PricingSnapshot snapshot) {
        return new LegacyPricingSnapshot(snapshot.pricingRequestId(), snapshot.pricingQuoteId(), snapshot.status(),
                snapshot.quotedAmounts(), snapshot.receivedAt(), snapshot.correlationId());
    }
}
