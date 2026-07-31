package com.linercore.platform.chargeagreement.applicationservice.port;

public interface AgreementAuthorizationPort {
    Decision authorize(String subjectId, String resource, String action, String correlationId);

    enum Decision {
        ALLOW,
        DENY,
        UNAVAILABLE
    }
}
