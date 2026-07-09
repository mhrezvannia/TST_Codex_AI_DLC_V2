package com.linercore.platform.booking.domain.model;

import java.time.Instant;

public record DndTriggerCandidate(
        String candidateId,
        String reason,
        String correlationId,
        Instant recordedAt) {
}
