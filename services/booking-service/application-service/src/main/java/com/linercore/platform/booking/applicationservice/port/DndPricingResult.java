package com.linercore.platform.booking.applicationservice.port;

import java.util.Map;

public record DndPricingResult(
        String dndPricingRef,
        DndPricingOutcome outcome,
        int chargeableDays,
        Map<String, String> lineItems,
        String reasonCode,
        String reasonMessage,
        String correlationId) {
    public DndPricingResult {
        if (outcome == null) {
            throw new IllegalArgumentException("dnd pricing outcome is required");
        }
        lineItems = Map.copyOf(lineItems == null ? Map.of() : lineItems);
        if (outcome == DndPricingOutcome.PRICED && (dndPricingRef == null || dndPricingRef.isBlank())) {
            throw new IllegalArgumentException("dnd pricing ref is required");
        }
    }

    public static DndPricingResult priced(String dndPricingRef, int chargeableDays, Map<String, String> lineItems, String correlationId) {
        return new DndPricingResult(dndPricingRef, DndPricingOutcome.PRICED, chargeableDays, lineItems, null, null, correlationId);
    }

    public static DndPricingResult failure(DndPricingOutcome outcome, String reasonCode, String reasonMessage, String correlationId) {
        if (outcome == DndPricingOutcome.PRICED) {
            throw new IllegalArgumentException("failure outcome is required");
        }
        return new DndPricingResult(null, outcome, 0, Map.of(), reasonCode, reasonMessage, correlationId);
    }
}
