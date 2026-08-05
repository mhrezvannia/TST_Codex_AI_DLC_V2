package com.linercore.platform.chargeagreement.domain.outbox;

import java.time.Instant;

public record EventPublicationStatusView(
        String eventId,
        String agreementId,
        OutboxStatus status,
        int attemptCount,
        Instant claimedAt,
        Instant publishedAt,
        String brokerMetadata,
        String lastError,
        String correlationId) {
}
