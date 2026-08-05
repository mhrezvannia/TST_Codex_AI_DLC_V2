package com.linercore.platform.containermovement.applicationservice.command;

import com.linercore.platform.containermovement.domain.model.MovementEventType;
import java.time.Instant;

public record CaptureMovementCommand(
        String journeyId,
        MovementEventType eventType,
        String containerId,
        String locationId,
        Instant eventTime,
        String actorSubjectId,
        String idempotencyKey,
        String correlationId) {
}
