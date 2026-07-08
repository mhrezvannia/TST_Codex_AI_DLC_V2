package com.linercore.platform.referencedata.domain.outbox;

import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import java.time.Instant;

public record ReferenceEventEnvelope(
        String eventId,
        String eventType,
        String schemaVersion,
        String source,
        Instant occurredAt,
        String correlationId,
        String entityId,
        ReferenceOperation operation,
        String producer) {
}
