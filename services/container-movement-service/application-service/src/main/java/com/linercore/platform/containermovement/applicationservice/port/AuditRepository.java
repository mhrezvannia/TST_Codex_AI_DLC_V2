package com.linercore.platform.containermovement.applicationservice.port;

public interface AuditRepository {
    void append(String action, String journeyId, String actorSubjectId, String outcome, String reasonCode, String correlationId);
}
