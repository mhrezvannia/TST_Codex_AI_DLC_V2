package com.linercore.platform.referencedata.domain.model;

import java.time.Instant;
import java.util.Map;

public record ReferenceRecord(
        ReferenceId id,
        ReferenceSet set,
        ReferenceCode code,
        String displayName,
        ReferenceStatus status,
        long version,
        AuditActor createdBy,
        Instant createdAt,
        AuditActor updatedBy,
        Instant updatedAt,
        AuditActor statusChangedBy,
        Instant statusChangedAt,
        String changeReason,
        Map<String, String> attributes) {
    public ReferenceRecord {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("display name is required");
        }
        attributes = attributes == null ? Map.of() : Map.copyOf(attributes);
    }

    public ReferenceRecord withUpdate(ReferenceCode newCode, String newDisplayName, Map<String, String> newAttributes, AuditActor actor, Instant now, String reason) {
        return new ReferenceRecord(id, set, newCode, newDisplayName, status, version + 1, createdBy, createdAt,
                actor, now, statusChangedBy, statusChangedAt, reason, newAttributes);
    }

    public ReferenceRecord withStatus(ReferenceStatus newStatus, AuditActor actor, Instant now, String reason) {
        return new ReferenceRecord(id, set, code, displayName, newStatus, version + 1, createdBy, createdAt,
                actor, now, actor, now, reason, attributes);
    }
}
