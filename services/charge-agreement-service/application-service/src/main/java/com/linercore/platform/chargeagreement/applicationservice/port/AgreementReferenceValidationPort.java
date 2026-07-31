package com.linercore.platform.chargeagreement.applicationservice.port;

import java.util.List;

public interface AgreementReferenceValidationPort {
    List<Violation> validate(Request request);

    record Request(String correlationId, List<Check> checks) {
        public Request {
            checks = List.copyOf(checks);
        }
    }

    record Check(String fieldPath, String referenceSet, String referenceId) {
    }

    record Violation(String fieldPath, String reason) {
    }
}
