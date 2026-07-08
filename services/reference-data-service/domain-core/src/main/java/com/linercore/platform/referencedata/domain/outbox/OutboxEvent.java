package com.linercore.platform.referencedata.domain.outbox;

import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.time.Instant;
import java.util.Map;

public record OutboxEvent(
        String eventId,
        String eventType,
        ReferenceSet referenceSet,
        String entityId,
        ReferenceOperation operation,
        Map<String, String> payload,
        String schemaVersion,
        OutboxStatus status,
        int attemptCount,
        Instant nextAttemptAt,
        String claimedBy,
        Instant claimedAt,
        String lastErrorCode,
        String lastErrorMessage,
        String correlationId,
        Instant occurredAt) {
    public OutboxEvent claim(String workerId, Instant now) {
        return new OutboxEvent(eventId, eventType, referenceSet, entityId, operation, payload, schemaVersion,
                OutboxStatus.IN_PROGRESS, attemptCount, nextAttemptAt, workerId, now, lastErrorCode, lastErrorMessage,
                correlationId, occurredAt);
    }

    public OutboxEvent published(BrokerMetadata metadata, Instant now) {
        return new OutboxEvent(eventId, eventType, referenceSet, entityId, operation,
                withBrokerMetadata(metadata), schemaVersion, OutboxStatus.PUBLISHED, attemptCount, null, claimedBy,
                claimedAt, null, null, correlationId, occurredAt);
    }

    public OutboxEvent retryable(String code, String message, Instant nextAttempt) {
        return new OutboxEvent(eventId, eventType, referenceSet, entityId, operation, payload, schemaVersion,
                OutboxStatus.RETRYABLE, attemptCount + 1, nextAttempt, null, null, code, message, correlationId, occurredAt);
    }

    public OutboxEvent failedPermanent(String code, String message) {
        return new OutboxEvent(eventId, eventType, referenceSet, entityId, operation, payload, schemaVersion,
                OutboxStatus.FAILED_PERMANENT, attemptCount + 1, null, null, null, code, message, correlationId, occurredAt);
    }

    public OutboxEvent recoveryRequired(String code, String message) {
        return new OutboxEvent(eventId, eventType, referenceSet, entityId, operation, payload, schemaVersion,
                OutboxStatus.RECOVERY_REQUIRED, attemptCount, null, null, null, code, message, correlationId, occurredAt);
    }

    private Map<String, String> withBrokerMetadata(BrokerMetadata metadata) {
        java.util.HashMap<String, String> next = new java.util.HashMap<>(payload);
        next.put("topic", metadata.topic());
        next.put("partition", String.valueOf(metadata.partition()));
        next.put("offset", String.valueOf(metadata.offset()));
        next.put("publishedAt", metadata.publishedAt().toString());
        return Map.copyOf(next);
    }
}
