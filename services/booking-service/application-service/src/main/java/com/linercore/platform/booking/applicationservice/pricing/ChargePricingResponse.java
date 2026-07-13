package com.linercore.platform.booking.applicationservice.pricing;

import java.util.List;

public record ChargePricingResponse(
        String pricingRef,
        String pricingBasis,
        List<ChargePricingLineItem> lineItems,
        boolean manualPricingRequired,
        String reasonCode,
        String correlationId) {
    public ChargePricingResponse {
        if (correlationId == null || correlationId.isBlank()) {
            throw new IllegalArgumentException("correlation id is required");
        }
        pricingBasis = pricingBasis == null ? "" : pricingBasis;
        lineItems = List.copyOf(lineItems == null ? List.of() : lineItems);
        if (!manualPricingRequired && (pricingRef == null || pricingRef.isBlank())) {
            throw new IllegalArgumentException("pricing ref is required");
        }
    }
}
