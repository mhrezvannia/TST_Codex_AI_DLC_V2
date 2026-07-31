package com.linercore.platform.booking.applicationservice.pricing;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ChargePricingResponse(
        String bookingRef,
        String pricingBasis,
        String pricingRef,
        List<ChargePricingLineItem> lineItems,
        List<String> applicableDndRuleTypes,
        BigDecimal total,
        String currency,
        LocalDate requestedDepartureDate,
        String pricingRequestId,
        String correlationId,
        Instant pricedAt,
        String agreementVersionId) {
    public ChargePricingResponse {
        if (bookingRef == null || bookingRef.isBlank()) {
            throw new IllegalArgumentException("booking ref is required");
        }
        if (pricingBasis == null || pricingBasis.isBlank()) {
            throw new IllegalArgumentException("pricing basis is required");
        }
        if (pricingRef == null || pricingRef.isBlank()) {
            throw new IllegalArgumentException("pricing ref is required");
        }
        lineItems = List.copyOf(lineItems == null ? List.of() : lineItems);
        applicableDndRuleTypes =
                List.copyOf(applicableDndRuleTypes == null ? List.of() : applicableDndRuleTypes);
    }

    public boolean hasAnyTypedEnrichment() {
        return total != null
                || currency != null
                || requestedDepartureDate != null
                || pricingRequestId != null
                || correlationId != null
                || pricedAt != null
                || agreementVersionId != null
                || lineItems.stream().anyMatch(ChargePricingLineItem::hasAnyTypedEnrichment);
    }

    public boolean hasCompleteTypedEnrichment() {
        return total != null
                && currency != null
                && requestedDepartureDate != null
                && pricingRequestId != null
                && correlationId != null
                && pricedAt != null
                && lineItems.stream().allMatch(ChargePricingLineItem::hasCompleteTypedEnrichment);
    }
}
