package com.linercore.platform.booking.applicationservice.event;

import java.time.Instant;
import java.util.Map;

public record MovementStatusReceivedEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String source,
        Instant occurredAt,
        String correlationId,
        String idempotencyKey,
        String containerId,
        String bookingId,
        String movementStatus,
        long sequenceNumber,
        String statusReason,
        String lastKnownLocationId) {
    public MovementStatusReceivedEvent {
        require(eventId, "event id is required");
        require(eventType, "event type is required");
        require(schemaVersion, "schema version is required");
        require(source, "source is required");
        require(correlationId, "correlation id is required");
        require(idempotencyKey, "idempotency key is required");
        require(containerId, "container id is required");
        require(bookingId, "booking id is required");
        require(movementStatus, "movement status is required");
        if (!"containermovement.status".equals(eventType)) {
            throw new IllegalArgumentException("unsupported movement status event type");
        }
        if (sequenceNumber < 0) {
            throw new IllegalArgumentException("sequence number must not be negative");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurred at is required");
        }
    }

    public static MovementStatusReceivedEvent fromPayload(Map<String, String> payload) {
        return new MovementStatusReceivedEvent(
                payload.get("eventId"),
                payload.get("eventType"),
                payload.get("schemaVersion"),
                payload.get("source"),
                Instant.parse(payload.get("occurredAt")),
                payload.get("correlationId"),
                payload.get("idempotencyKey"),
                payload.get("containerId"),
                payload.get("bookingId"),
                payload.get("movementStatus"),
                Long.parseLong(payload.get("sequenceNumber")),
                payload.getOrDefault("statusReason", ""),
                payload.getOrDefault("lastKnownLocationId", ""));
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
