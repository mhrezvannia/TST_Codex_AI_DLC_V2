package com.linercore.platform.referencedata.domain.model;

import java.time.Instant;

public record ReferenceChange(
        String changeId,
        ReferenceSet referenceSet,
        ReferenceId recordId,
        ReferenceOperation operation,
        String beforeSummary,
        String afterSummary,
        AuditActor changedBy,
        Instant changedAt,
        String reason,
        String correlationId) {
}
