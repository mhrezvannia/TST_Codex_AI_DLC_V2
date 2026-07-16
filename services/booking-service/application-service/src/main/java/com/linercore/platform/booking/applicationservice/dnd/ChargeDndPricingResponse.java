package com.linercore.platform.booking.applicationservice.dnd;

import java.util.List;

public record ChargeDndPricingResponse(
        String dndPricingRef,
        String correlationId,
        int chargeableDays,
        List<String> lineItems) {
    public ChargeDndPricingResponse {
        if (dndPricingRef == null || dndPricingRef.isBlank()) {
            throw new IllegalArgumentException("dnd pricing ref is required");
        }
        lineItems = List.copyOf(lineItems == null ? List.of() : lineItems);
    }
}
