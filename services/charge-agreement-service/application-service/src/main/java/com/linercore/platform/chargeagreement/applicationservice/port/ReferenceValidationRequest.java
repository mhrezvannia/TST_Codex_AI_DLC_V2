package com.linercore.platform.chargeagreement.applicationservice.port;

import java.util.List;

public record ReferenceValidationRequest(List<String> referenceIds) {
    public ReferenceValidationRequest {
        referenceIds = referenceIds == null ? List.of() : List.copyOf(referenceIds);
    }
}
