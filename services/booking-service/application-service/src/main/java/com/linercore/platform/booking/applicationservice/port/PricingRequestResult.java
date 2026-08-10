package com.linercore.platform.booking.applicationservice.port;

import java.util.Map;

public record PricingRequestResult(
        String pricingRequestId,
        String pricingQuoteId,
        PricingOutcome outcome,
        Map<String, String> quotedAmounts,
        String reasonCode,
        String reasonMessage,
        String correlationId) {
    public PricingRequestResult {
        if (pricingRequestId == null || pricingRequestId.isBlank()) {
            throw new IllegalArgumentException("pricing request id is required");
        }
        if (outcome == null) {
            throw new IllegalArgumentException("pricing outcome is required");
        }
        quotedAmounts = Map.copyOf(quotedAmounts == null ? Map.of() : quotedAmounts);
    }

    public static PricingRequestResult priced(
            String pricingRequestId,
            String pricingQuoteId,
            Map<String, String> quotedAmounts,
            String correlationId) {
        if (pricingQuoteId == null || pricingQuoteId.isBlank()) {
            throw new IllegalArgumentException("pricing quote id is required");
        }
        return new PricingRequestResult(pricingRequestId, pricingQuoteId, PricingOutcome.PRICED,
                quotedAmounts, null, null, correlationId);
    }

    public static PricingRequestResult pending(String pricingRequestId, String correlationId) {
        return new PricingRequestResult(pricingRequestId, null, PricingOutcome.PENDING, Map.of(),
                null, null, correlationId);
    }

    public static PricingRequestResult manual(
            String pricingRequestId,
            String reasonCode,
            String reasonMessage,
            String correlationId) {
        return new PricingRequestResult(pricingRequestId, null, PricingOutcome.MANUAL_REQUIRED,
                Map.of(), reasonCode, reasonMessage, correlationId);
    }

    public static PricingRequestResult failure(
            String pricingRequestId,
            PricingOutcome outcome,
            String reasonCode,
            String reasonMessage,
            String correlationId) {
        if (outcome == PricingOutcome.PENDING || outcome == PricingOutcome.PRICED || outcome == PricingOutcome.MANUAL_REQUIRED) {
            throw new IllegalArgumentException("failure outcome is required");
        }
        return new PricingRequestResult(pricingRequestId, null, outcome, Map.of(), reasonCode, reasonMessage, correlationId);
    }
}
