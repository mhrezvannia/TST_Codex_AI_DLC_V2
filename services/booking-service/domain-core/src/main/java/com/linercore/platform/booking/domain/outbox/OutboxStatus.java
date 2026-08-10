package com.linercore.platform.booking.domain.outbox;

public enum OutboxStatus {
    PENDING,
    IN_PROGRESS,
    PUBLISHED,
    RETRYABLE,
    FAILED_PERMANENT
}
