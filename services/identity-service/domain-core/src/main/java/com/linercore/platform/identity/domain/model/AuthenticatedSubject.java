package com.linercore.platform.identity.domain.model;

public record AuthenticatedSubject(
        String subjectId,
        String username,
        String displayName,
        String email,
        String issuer,
        String tenantOrCarrierCode,
        String claimVersion) {
    public AuthenticatedSubject {
        if (subjectId == null || subjectId.isBlank()) {
            throw new IllegalArgumentException("subject id is required");
        }
    }
}
