package com.linercore.platform.booking.domain.model;

public enum BookingStatus {
    DRAFT,
    VALIDATION_BLOCKED,
    VALIDATED,
    PRICING_PENDING,
    MANUAL_PRICING,
    PRICED,
    CONFIRMED,
    AMENDED,
    RECONFIRMED,
    EXCEPTION
}
