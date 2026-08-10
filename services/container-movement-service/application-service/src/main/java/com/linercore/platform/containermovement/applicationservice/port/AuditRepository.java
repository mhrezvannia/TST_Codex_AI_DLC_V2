package com.linercore.platform.containermovement.applicationservice.port;

public interface AuditRepository {
    void append(String action, String journeyId, String actorSubjectId, String outcome, String reasonCode, String correlationId);

    default void appendDurableRejection(
            String action,
            String journeyId,
            String actorSubjectId,
            String reasonCode,
            String correlationId) {
        append(action, journeyId, actorSubjectId, "DENY", reasonCode, correlationId);
    }
}
