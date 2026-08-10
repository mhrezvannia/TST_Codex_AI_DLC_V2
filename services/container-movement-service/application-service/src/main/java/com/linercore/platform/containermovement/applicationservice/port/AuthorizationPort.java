package com.linercore.platform.containermovement.applicationservice.port;

public interface AuthorizationPort {
    boolean allowed(String subjectId, String resource, String action, String correlationId);
}
