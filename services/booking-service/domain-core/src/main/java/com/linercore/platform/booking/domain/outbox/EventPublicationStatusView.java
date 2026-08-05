package com.linercore.platform.booking.domain.outbox;

import java.time.Instant;

public record EventPublicationStatusView(
        String eventId,
        String bookingId,
        OutboxStatus status,
        int attemptCount,
        Instant claimedAt,
        Instant publishedAt,
        String brokerMetadata,
        String lastError,
        String correlationId) {
}
