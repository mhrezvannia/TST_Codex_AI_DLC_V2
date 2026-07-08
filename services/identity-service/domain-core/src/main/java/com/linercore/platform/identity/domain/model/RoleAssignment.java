package com.linercore.platform.identity.domain.model;

import java.time.Instant;

public record RoleAssignment(
        String assignmentId,
        String subjectId,
        String roleId,
        AssignmentStatus status,
        String assignedBy,
        Instant assignedAt,
        String revokedBy,
        Instant revokedAt,
        String reason,
        long version) {
    public boolean active() {
        return status == AssignmentStatus.ACTIVE;
    }
}
