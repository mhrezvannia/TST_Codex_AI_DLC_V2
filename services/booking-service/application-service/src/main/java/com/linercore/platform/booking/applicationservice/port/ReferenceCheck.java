package com.linercore.platform.booking.applicationservice.port;

public record ReferenceCheck(String fieldPath, ReferenceSet referenceSet, String requestedValue) {
    public ReferenceCheck {
        if (fieldPath == null || fieldPath.isBlank()) {
            throw new IllegalArgumentException("field path is required");
        }
        if (referenceSet == null) {
            throw new IllegalArgumentException("reference set is required");
        }
        if (requestedValue == null || requestedValue.isBlank()) {
            throw new IllegalArgumentException("requested reference value is required");
        }
        fieldPath = fieldPath.trim();
        requestedValue = requestedValue.trim();
    }
}
