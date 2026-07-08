package com.linercore.platform.identity.domain.model;

import java.time.Instant;

public record RolePermission(String roleId, String permissionId, Instant effectiveFrom, Instant effectiveTo, String policyVersion) {
    public boolean activeAt(Instant instant) {
        boolean started = effectiveFrom == null || !instant.isBefore(effectiveFrom);
        boolean notEnded = effectiveTo == null || instant.isBefore(effectiveTo);
        return started && notEnded;
    }
}
