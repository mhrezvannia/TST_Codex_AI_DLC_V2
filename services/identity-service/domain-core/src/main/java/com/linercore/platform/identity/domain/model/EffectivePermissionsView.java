package com.linercore.platform.identity.domain.model;

import java.time.Instant;
import java.util.List;

public record EffectivePermissionsView(
        AuthenticatedSubject subject,
        List<Role> roles,
        List<Permission> permissions,
        String policyVersion,
        Instant generatedAt) {
}
