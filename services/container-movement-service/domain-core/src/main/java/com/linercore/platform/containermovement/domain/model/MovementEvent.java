package com.linercore.platform.containermovement.domain.model;

import java.time.Instant;

public record MovementEvent(
        String eventId,
        MovementEventType eventType,
        String containerId,
        String locationId,
        Instant eventTime,
        DedupeKey dedupeKey,
        String correlationId) {
    public MovementEvent {
        if (eventId == null || eventId.isBlank()) {
            throw new IllegalArgumentException("event id is required");
        }
        if (containerId == null || containerId.isBlank()) {
            throw new IllegalArgumentException("container id is required");
        }
        if (locationId == null || locationId.isBlank()) {
            throw new IllegalArgumentException("location id is required");
        }
        if (eventTime == null) {
            throw new IllegalArgumentException("event time is required");
        }
    }
}
