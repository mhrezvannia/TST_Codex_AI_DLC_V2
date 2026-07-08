package com.linercore.platform.identity.domain.model;

import java.time.Instant;

public record AuthorizationAuditRecord(
        String auditId,
        String eventType,
        String actorSubjectId,
        String targetSubjectId,
        String resource,
        String action,
        String beforeValue,
        String afterValue,
        String reason,
        String result,
        Instant occurredAt,
        String correlationId) {
}
