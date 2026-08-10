package com.linercore.platform.containermovement.domain.outbox;

import com.linercore.platform.containermovement.domain.model.MovementStatus;
import java.time.Instant;
import java.util.Map;

public record MovementStatusEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String journeyId,
        String bookingId,
        String containerId,
        MovementStatus status,
        String schemaSubject,
        String producerIdentity,
        String deduplicationKey,
        String correlationId,
        Instant occurredAt,
        Map<String, String> payload,
        OutboxStatus outboxStatus,
        int attemptCount,
        Instant nextAttemptAt,
        String claimedBy,
        Instant claimedAt,
        String lastErrorCode,
        String lastErrorMessage) {
    public MovementStatusEvent {
        payload = Map.copyOf(payload == null ? Map.of() : payload);
    }

    public MovementStatusEvent claim(String workerId, Instant now) {
        return copy(payload, OutboxStatus.IN_PROGRESS, attemptCount, nextAttemptAt,
                workerId, now, lastErrorCode, lastErrorMessage);
    }

    public MovementStatusEvent published(BrokerMetadata metadata) {
        java.util.HashMap<String, String> publishedPayload = new java.util.HashMap<>(payload);
        publishedPayload.put("topic", metadata.topic());
        publishedPayload.put("partition", String.valueOf(metadata.partition()));
        publishedPayload.put("offset", String.valueOf(metadata.offset()));
        publishedPayload.put("publishedAt", metadata.publishedAt().toString());
        return copy(Map.copyOf(publishedPayload), OutboxStatus.PUBLISHED, attemptCount,
                null, claimedBy, claimedAt, null, null);
    }

    public MovementStatusEvent retryable(String code, String message, Instant nextAttempt) {
        return copy(payload, OutboxStatus.RETRYABLE, attemptCount + 1,
                nextAttempt, null, null, code, message);
    }

    public MovementStatusEvent failedPermanent(String code, String message) {
        return copy(payload, OutboxStatus.FAILED_PERMANENT, attemptCount + 1,
                null, null, null, code, message);
    }

    private MovementStatusEvent copy(
            Map<String, String> nextPayload,
            OutboxStatus nextStatus,
            int nextAttemptCount,
            Instant nextAttempt,
            String nextClaimedBy,
            Instant nextClaimedAt,
            String nextErrorCode,
            String nextErrorMessage) {
        return new MovementStatusEvent(eventId, eventType, schemaVersion, journeyId, bookingId, containerId,
                status, schemaSubject, producerIdentity, deduplicationKey, correlationId, occurredAt,
                nextPayload, nextStatus, nextAttemptCount, nextAttempt, nextClaimedBy, nextClaimedAt,
                nextErrorCode, nextErrorMessage);
    }
}
