package com.linercore.platform.booking.domain.outbox;

import java.time.Instant;
import java.util.Map;

public record BookingOutboxEvent(
        String eventId,
        String eventType,
        String schemaVersion,
        String bookingId,
        String bookingNumber,
        int revision,
        String schemaSubject,
        String producerIdentity,
        String deduplicationKey,
        String correlationId,
        Instant occurredAt,
        Map<String, String> payload,
        OutboxStatus status,
        int attemptCount,
        Instant nextAttemptAt,
        String claimedBy,
        Instant claimedAt,
        String lastErrorCode,
        String lastErrorMessage) {
    public BookingOutboxEvent {
        payload = Map.copyOf(payload == null ? Map.of() : payload);
    }

    public BookingOutboxEvent claim(String workerId, Instant now) {
        return copy(payload, OutboxStatus.IN_PROGRESS, attemptCount, nextAttemptAt,
                workerId, now, lastErrorCode, lastErrorMessage);
    }

    public BookingOutboxEvent published(BrokerMetadata metadata) {
        java.util.HashMap<String, String> publishedPayload = new java.util.HashMap<>(payload);
        publishedPayload.put("topic", metadata.topic());
        publishedPayload.put("partition", String.valueOf(metadata.partition()));
        publishedPayload.put("offset", String.valueOf(metadata.offset()));
        publishedPayload.put("publishedAt", metadata.publishedAt().toString());
        return copy(Map.copyOf(publishedPayload), OutboxStatus.PUBLISHED, attemptCount,
                null, claimedBy, claimedAt, null, null);
    }

    public BookingOutboxEvent retryable(String code, String message, Instant nextAttempt) {
        return copy(payload, OutboxStatus.RETRYABLE, attemptCount + 1,
                nextAttempt, null, null, code, message);
    }

    public BookingOutboxEvent failedPermanent(String code, String message) {
        return copy(payload, OutboxStatus.FAILED_PERMANENT, attemptCount + 1,
                null, null, null, code, message);
    }

    private BookingOutboxEvent copy(
            Map<String, String> nextPayload,
            OutboxStatus nextStatus,
            int nextAttemptCount,
            Instant nextAttempt,
            String nextClaimedBy,
            Instant nextClaimedAt,
            String nextErrorCode,
            String nextErrorMessage) {
        return new BookingOutboxEvent(eventId, eventType, schemaVersion, bookingId, bookingNumber, revision,
                schemaSubject, producerIdentity, deduplicationKey, correlationId, occurredAt, nextPayload,
                nextStatus, nextAttemptCount, nextAttempt, nextClaimedBy, nextClaimedAt,
                nextErrorCode, nextErrorMessage);
    }
}
