package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;
import java.util.List;

public record BookingReferenceValidationRequest(
        BookingId bookingId,
        int bookingRevision,
        String referenceFingerprint,
        List<ReferenceCheck> checks) {

    public BookingReferenceValidationRequest {
        if (bookingId == null || bookingRevision < 1) {
            throw new IllegalArgumentException("booking identity and revision are required");
        }
        if (referenceFingerprint == null || referenceFingerprint.isBlank()) {
            throw new IllegalArgumentException("reference fingerprint is required");
        }
        checks = List.copyOf(checks == null ? List.of() : checks);
        if (checks.isEmpty()) {
            throw new IllegalArgumentException("reference checks are required");
        }
    }
}
