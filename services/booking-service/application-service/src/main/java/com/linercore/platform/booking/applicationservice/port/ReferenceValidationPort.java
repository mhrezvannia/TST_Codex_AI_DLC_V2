package com.linercore.platform.booking.applicationservice.port;

public interface ReferenceValidationPort {
    boolean activeReference(String referenceSet, String referenceId, String correlationId);
}
