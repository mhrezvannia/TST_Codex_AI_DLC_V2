package com.linercore.platform.booking.applicationservice.port;

public interface AuthorizationPort {
    boolean allowed(String subjectId, String resource, String action, String correlationId);
}
