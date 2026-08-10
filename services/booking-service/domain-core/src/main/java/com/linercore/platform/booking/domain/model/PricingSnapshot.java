package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.util.Map;

public record PricingSnapshot(
        String pricingRequestId,
        String pricingQuoteId,
        String status,
        Map<String, String> quotedAmounts,
        Instant receivedAt,
        String correlationId,
        BookingPricingSnapshot typed,
        LegacyPricingSnapshot legacy) {
    public PricingSnapshot(
            String pricingRequestId,
            String pricingQuoteId,
            String status,
            Map<String, String> quotedAmounts,
            Instant receivedAt,
            String correlationId) {
        this(pricingRequestId, pricingQuoteId, status, quotedAmounts, receivedAt, correlationId, null, null);
    }

    public PricingSnapshot {
        quotedAmounts = Map.copyOf(quotedAmounts == null ? Map.of() : quotedAmounts);
        if (typed != null && legacy != null) {
            throw new IllegalArgumentException("pricing snapshot cannot be both typed and legacy");
        }
        if (typed == null && (pricingQuoteId == null || pricingQuoteId.isBlank())) {
            throw new IllegalArgumentException("pricing quote id is required");
        }
        if (typed == null && legacy == null) {
            legacy = new LegacyPricingSnapshot(
                    pricingRequestId, pricingQuoteId, status, quotedAmounts, receivedAt, correlationId);
        }
    }

    public static PricingSnapshot typed(BookingPricingSnapshot snapshot) {
        if (snapshot == null) {
            throw new IllegalArgumentException("typed pricing snapshot is required");
        }
        return new PricingSnapshot(snapshot.pricingRequestId(), snapshot.pricingRef(), "QUOTED", Map.of(),
                snapshot.createdAt(), snapshot.correlationId(), snapshot, null);
    }

    public boolean confirmationEligible(int amendmentSeq, String inputFingerprint) {
        return typed == null || typed.isCurrentFor(amendmentSeq, inputFingerprint);
    }
}
