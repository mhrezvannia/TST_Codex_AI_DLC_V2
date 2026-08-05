package com.linercore.platform.chargeagreement.applicationservice.port;

@FunctionalInterface
public interface RateAuthorizationPort {
    Decision authorize(String subjectId, String resource, String action, String correlationId);

    enum Decision {
        ALLOW,
        DENY,
        UNAVAILABLE
    }
}
