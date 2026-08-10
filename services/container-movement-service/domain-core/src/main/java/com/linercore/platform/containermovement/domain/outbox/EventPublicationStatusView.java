package com.linercore.platform.containermovement.domain.outbox;

import java.time.Instant;

public record EventPublicationStatusView(
        String eventId,
        String journeyId,
        OutboxStatus status,
        int attemptCount,
        Instant claimedAt,
        Instant publishedAt,
        String brokerMetadata,
        String lastError,
        String correlationId) {
}
