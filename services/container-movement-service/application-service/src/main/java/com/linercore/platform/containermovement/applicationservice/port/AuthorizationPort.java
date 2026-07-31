package com.linercore.platform.containermovement.applicationservice.port;

public interface AuthorizationPort {
    boolean allowed(String subjectId, String resource, String action, String correlationId);

    default Decision decision(String subjectId, String resource, String action, String correlationId) {
        return allowed(subjectId, resource, action, correlationId) ? Decision.ALLOW : Decision.DENY;
    }

    enum Decision {
        ALLOW,
        DENY,
        UNAVAILABLE
    }
}
