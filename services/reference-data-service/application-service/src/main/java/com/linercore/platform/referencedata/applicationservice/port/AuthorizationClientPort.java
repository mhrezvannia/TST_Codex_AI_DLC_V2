package com.linercore.platform.referencedata.applicationservice.port;

public interface AuthorizationClientPort {
    boolean allowed(String subjectId, String resource, String action, String correlationId);
}
