package com.linercore.platform.chargeagreement.applicationservice.port;

import java.util.List;

@FunctionalInterface
public interface RateReferenceValidationPort {
    List<Violation> validate(Request request);

    record Request(String correlationId, List<Check> checks) {
        public Request {
            checks = List.copyOf(checks);
            if (checks.size() > 5) {
                throw new IllegalArgumentException("at most five reference checks are allowed");
            }
        }
    }

    record Check(String fieldPath, String referenceSet, String requestedId, String expectedCode) {
    }

    record Violation(String fieldPath, String reason) {
    }
}
