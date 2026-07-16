package com.linercore.platform.booking.domain.model;

public record ReferenceFieldResult(
        String fieldPath,
        String referenceSet,
        String requestedValue,
        ReferenceValidationFieldOutcome outcome,
        String recordId,
        String recordCode,
        Long recordVersion,
        String reasonCode) {

    public ReferenceFieldResult {
        fieldPath = required(fieldPath, "field path");
        referenceSet = required(referenceSet, "reference set");
        requestedValue = required(requestedValue, "requested value");
        if (outcome == null) {
            throw new IllegalArgumentException("reference outcome is required");
        }
        reasonCode = required(reasonCode, "reason code");
    }

    public ReferenceFieldResult mismatch(String code) {
        return new ReferenceFieldResult(fieldPath, referenceSet, requestedValue,
                ReferenceValidationFieldOutcome.MISMATCH, recordId, recordCode, recordVersion, code);
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}
