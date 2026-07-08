package com.linercore.platform.referencedata.domain.outbox;

import java.time.Instant;

public record PublicationAttempt(
        String attemptId,
        String eventId,
        int attemptNumber,
        Instant startedAt,
        Instant finishedAt,
        String result,
        BrokerMetadata brokerMetadata,
        String errorCode,
        String correlationId) {
}
