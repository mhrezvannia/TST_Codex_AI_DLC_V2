package com.linercore.platform.booking.applicationservice.port;

public interface ReferenceValidationPort {
    ReferenceValidationResult validate(BookingReferenceValidationRequest request, String correlationId);
}
