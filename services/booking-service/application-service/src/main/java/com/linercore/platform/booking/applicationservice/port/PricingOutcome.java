package com.linercore.platform.booking.applicationservice.port;

public enum PricingOutcome {
    PENDING,
    PRICED,
    MANUAL_REQUIRED,
    TRANSIENT_FAILURE,
    DENIED,
    VALIDATION_FAILED
}
