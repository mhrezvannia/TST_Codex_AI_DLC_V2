package com.linercore.platform.chargeagreement.domain.model;

import java.time.LocalDate;
import java.util.Map;

public record PricingRequest(
        String requestId,
        ReferenceId customerId,
        ReferenceId tradeLaneId,
        ReferenceId commodityId,
        LocalDate effectiveDate,
        Map<ChargeBasis, Integer> quantities,
        String correlationId) {
    public PricingRequest {
        if (requestId == null || requestId.isBlank()) {
            throw new IllegalArgumentException("pricing request id is required");
        }
        if (customerId == null || tradeLaneId == null || commodityId == null) {
            throw new IllegalArgumentException("customer, trade lane, and commodity are required");
        }
        if (effectiveDate == null) {
            throw new IllegalArgumentException("effective date is required");
        }
        quantities = Map.copyOf(quantities == null ? Map.of() : quantities);
    }
}
