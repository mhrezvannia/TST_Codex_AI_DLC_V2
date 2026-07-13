package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.Booking;
import java.time.Instant;
import java.util.Map;

public record ChargePricingRequest(
        String pricingRequestId,
        String bookingId,
        String customerId,
        String originLocationId,
        String destinationLocationId,
        String equipmentType,
        Map<String, String> attributes,
        String idempotencyKey,
        String correlationId,
        String requestHash,
        Instant requestedAt) {
    public ChargePricingRequest {
        if (pricingRequestId == null || pricingRequestId.isBlank()) {
            throw new IllegalArgumentException("pricing request id is required");
        }
        if (bookingId == null || bookingId.isBlank()) {
            throw new IllegalArgumentException("booking id is required");
        }
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("customer id is required");
        }
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("idempotency key is required");
        }
        if (correlationId == null || correlationId.isBlank()) {
            throw new IllegalArgumentException("correlation id is required");
        }
        if (requestedAt == null) {
            throw new IllegalArgumentException("requested at is required");
        }
        attributes = Map.copyOf(attributes == null ? Map.of() : attributes);
    }

    public static ChargePricingRequest from(
            Booking booking,
            String idempotencyKey,
            String correlationId,
            String pricingRequestId,
            String requestHash,
            Instant requestedAt) {
        return new ChargePricingRequest(pricingRequestId, booking.id().value(), booking.customerId(),
                booking.originLocationId(), booking.destinationLocationId(), booking.equipmentType(),
                booking.attributes(), idempotencyKey, correlationId, requestHash, requestedAt);
    }
}
