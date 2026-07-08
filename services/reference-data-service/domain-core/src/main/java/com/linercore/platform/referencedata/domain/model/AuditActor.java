package com.linercore.platform.referencedata.domain.model;

public record AuditActor(String subjectId, String displayName) {
    public AuditActor {
        if (subjectId == null || subjectId.isBlank()) {
            throw new IllegalArgumentException("audit actor subject is required");
        }
    }
}
