package com.linercore.platform.booking.applicationservice.port;

public interface AuditRepository {
    void append(String eventType, String bookingId, String actorSubjectId, String result, String reason, String correlationId);
}
