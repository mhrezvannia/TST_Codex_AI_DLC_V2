package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;

public record IdempotencyReceipt(
        String idempotencyKey,
        String operation,
        String requestHash,
        BookingId bookingId,
        String state,
        Integer responseRevision) {
}
