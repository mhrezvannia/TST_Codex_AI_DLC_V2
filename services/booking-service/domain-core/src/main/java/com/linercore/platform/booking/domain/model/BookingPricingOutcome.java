package com.linercore.platform.booking.domain.model;

public enum BookingPricingOutcome {
    PRICED,
    LEGACY_PRICED,
    MANUAL_PRICING_REQUIRED,
    DENIED,
    MALFORMED,
    VALIDATION_FAILED,
    CONFLICT,
    IN_PROGRESS,
    TIMEOUT,
    UNAVAILABLE,
    CIRCUIT_OPEN,
    BOOKING_CHANGED
}
