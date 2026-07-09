package com.linercore.platform.chargeagreement.applicationservice.port;

public interface AuthorizationPort {
    boolean allowed(String subjectId, String resource, String action, String correlationId);
}
