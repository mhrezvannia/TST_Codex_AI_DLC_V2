package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.util.List;

public record ReferenceValidationSnapshot(
        int bookingRevision,
        String referenceFingerprint,
        ReferenceValidationOutcome outcome,
        List<ReferenceFieldResult> fieldResults,
        Instant checkedAt,
        String correlationId) {

    public ReferenceValidationSnapshot {
        if (bookingRevision < 1) {
            throw new IllegalArgumentException("booking revision must be positive");
        }
        referenceFingerprint = required(referenceFingerprint, "reference fingerprint");
        if (outcome == null) {
            throw new IllegalArgumentException("validation outcome is required");
        }
        fieldResults = List.copyOf(fieldResults == null ? List.of() : fieldResults);
        if (fieldResults.isEmpty()) {
            throw new IllegalArgumentException("validation field results are required");
        }
        if (checkedAt == null) {
            throw new IllegalArgumentException("validation check time is required");
        }
        correlationId = required(correlationId, "correlation id");
        boolean fieldsValid = fieldResults.stream()
                .allMatch(result -> result.outcome() == ReferenceValidationFieldOutcome.ACTIVE);
        if ((outcome == ReferenceValidationOutcome.VALID) != fieldsValid) {
            throw new IllegalArgumentException("validation outcome does not match field results");
        }
    }

    public boolean equivalentTo(ReferenceValidationSnapshot other) {
        return other != null
                && bookingRevision == other.bookingRevision
                && referenceFingerprint.equals(other.referenceFingerprint)
                && outcome == other.outcome
                && fieldResults.equals(other.fieldResults);
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}
