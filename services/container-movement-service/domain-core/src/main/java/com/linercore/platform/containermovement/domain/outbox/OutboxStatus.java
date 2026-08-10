package com.linercore.platform.containermovement.domain.outbox;

public enum OutboxStatus {
    PENDING,
    IN_PROGRESS,
    PUBLISHED,
    RETRYABLE,
    FAILED_PERMANENT
}
