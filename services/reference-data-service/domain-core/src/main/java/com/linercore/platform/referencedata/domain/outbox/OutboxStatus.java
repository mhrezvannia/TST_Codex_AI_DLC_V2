package com.linercore.platform.referencedata.domain.outbox;

public enum OutboxStatus {
    PENDING,
    IN_PROGRESS,
    RETRYABLE,
    PUBLISHED,
    FAILED_PERMANENT,
    RECOVERY_REQUIRED
}
