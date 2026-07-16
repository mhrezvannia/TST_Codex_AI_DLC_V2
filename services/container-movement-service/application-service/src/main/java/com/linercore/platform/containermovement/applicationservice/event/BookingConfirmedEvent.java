package com.linercore.platform.containermovement.applicationservice.event;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record BookingConfirmedEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String source,
        Instant occurredAt,
        String correlationId,
        String idempotencyKey,
        String bookingId,
        int bookingRevision,
        String pricingRef,
        String customerId,
        String originLocationId,
        String destinationLocationId,
        String containerId,
        String equipmentTypeId) {
    public BookingConfirmedEvent {
        require(eventId, "event id is required");
        require(eventType, "event type is required");
        require(schemaVersion, "schema version is required");
        require(source, "source is required");
        require(correlationId, "correlation id is required");
        require(idempotencyKey, "idempotency key is required");
        require(bookingId, "booking id is required");
        require(originLocationId, "origin location id is required");
        require(destinationLocationId, "destination location id is required");
        require(equipmentTypeId, "equipment type id is required");
        if (!"booking.confirmed".equals(eventType)) {
            throw new IllegalArgumentException("unsupported booking event type");
        }
        if (bookingRevision < 1) {
            throw new IllegalArgumentException("booking revision must be positive");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurred at is required");
        }
    }

    public static BookingConfirmedEvent fromPayload(Map<String, String> payload) {
        return new BookingConfirmedEvent(
                payload.get("eventId"),
                payload.get("eventType"),
                payload.get("schemaVersion"),
                payload.get("source"),
                Instant.parse(payload.get("occurredAt")),
                payload.get("correlationId"),
                payload.get("idempotencyKey"),
                payload.get("bookingId"),
                Integer.parseInt(payload.get("bookingRevision")),
                payload.getOrDefault("pricingRef", ""),
                payload.getOrDefault("customerId", ""),
                payload.get("originLocationId"),
                payload.get("destinationLocationId"),
                payload.getOrDefault("containerId", ""),
                payload.get("equipmentTypeId"));
    }

    public List<String> routeLocationIds() {
        return List.of(originLocationId, destinationLocationId);
    }

    public String journeyContainerId() {
        if (containerId != null && !containerId.isBlank()) {
            return containerId;
        }
        return bookingId + "-" + equipmentTypeId;
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
