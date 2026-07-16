package com.linercore.platform.booking.applicationservice.dnd;

import com.linercore.platform.booking.domain.model.Booking;

public record ChargeDndPricingRequest(
        String bookingId,
        String containerId,
        String movementStatus,
        String idempotencyKey,
        String correlationId,
        String lastKnownLocationId) {
    public static ChargeDndPricingRequest from(Booking booking, String idempotencyKey, String correlationId) {
        return new ChargeDndPricingRequest(booking.id().value(),
                booking.attributes().getOrDefault("movementContainerId", ""),
                booking.attributes().getOrDefault("movementStatus", ""),
                idempotencyKey,
                correlationId,
                booking.attributes().getOrDefault("movementLastKnownLocationId", ""));
    }
}
