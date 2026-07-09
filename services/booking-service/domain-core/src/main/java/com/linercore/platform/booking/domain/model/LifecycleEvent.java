package com.linercore.platform.booking.domain.model;

import java.time.Instant;

public record LifecycleEvent(
        String eventType,
        BookingStatus status,
        int revision,
        String actorSubjectId,
        String correlationId,
        Instant occurredAt) {
}
