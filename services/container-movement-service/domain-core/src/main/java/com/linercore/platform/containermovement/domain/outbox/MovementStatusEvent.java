package com.linercore.platform.containermovement.domain.outbox;

import com.linercore.platform.containermovement.domain.model.MovementStatus;
import java.time.Instant;
import java.util.Map;

public record MovementStatusEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String journeyId,
        String bookingId,
        String containerId,
        MovementStatus status,
        String schemaSubject,
        String producerIdentity,
        String deduplicationKey,
        String correlationId,
        Instant occurredAt,
        Map<String, String> payload) {
    public MovementStatusEvent {
        payload = Map.copyOf(payload == null ? Map.of() : payload);
    }
}
