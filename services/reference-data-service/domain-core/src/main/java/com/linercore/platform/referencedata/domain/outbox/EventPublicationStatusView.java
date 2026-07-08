package com.linercore.platform.referencedata.domain.outbox;

import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.time.Instant;

public record EventPublicationStatusView(
        String eventId,
        String recordId,
        ReferenceSet referenceSet,
        String operation,
        OutboxStatus status,
        int attemptCount,
        Instant lastAttemptAt,
        Instant publishedAt,
        String brokerMetadata,
        String lastError,
        String correlationId) {
}
