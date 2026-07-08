package com.linercore.platform.identity.applicationservice.command;

public record AssignRoleCommand(
        String actorTokenReference,
        String targetSubjectId,
        String roleCode,
        String reason,
        long expectedVersion,
        String correlationId) {
}
