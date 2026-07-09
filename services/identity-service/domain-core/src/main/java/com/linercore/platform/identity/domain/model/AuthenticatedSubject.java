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

    public static AuthenticatedSubject user(String subjectId, String displayName, String email, String issuer, String tenantOrCarrierCode) {
        return new AuthenticatedSubject(subjectId, subjectId, displayName, email, issuer, tenantOrCarrierCode, "v1");
    }

    public static AuthenticatedSubject service(String serviceId, String displayName, String issuer, String tenantOrCarrierCode) {
        return new AuthenticatedSubject(serviceId, serviceId, displayName, null, issuer, tenantOrCarrierCode, "service-v1");
    }

    public boolean serviceSubject() {
        return claimVersion != null && claimVersion.startsWith("service-");
    }
}
