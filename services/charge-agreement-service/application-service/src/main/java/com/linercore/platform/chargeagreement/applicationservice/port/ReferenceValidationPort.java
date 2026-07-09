package com.linercore.platform.chargeagreement.applicationservice.port;

import java.util.List;

public interface ReferenceValidationPort {
    List<String> validate(ReferenceValidationRequest request);
}
