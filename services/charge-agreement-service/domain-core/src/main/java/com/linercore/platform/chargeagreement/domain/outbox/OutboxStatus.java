package com.linercore.platform.chargeagreement.domain.outbox;

public enum OutboxStatus {
    PENDING,
    IN_PROGRESS,
    PUBLISHED,
    RETRYABLE,
    FAILED_PERMANENT
}
