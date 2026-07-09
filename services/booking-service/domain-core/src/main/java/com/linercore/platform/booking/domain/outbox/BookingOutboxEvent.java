package com.linercore.platform.booking.domain.outbox;

import java.time.Instant;
import java.util.Map;

public record BookingOutboxEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String bookingId,
        String bookingNumber,
        int revision,
        String schemaSubject,
        String producerIdentity,
        String deduplicationKey,
        String correlationId,
        Instant occurredAt,
        Map<String, String> payload) {
    public BookingOutboxEvent {
        payload = Map.copyOf(payload == null ? Map.of() : payload);
    }
}
