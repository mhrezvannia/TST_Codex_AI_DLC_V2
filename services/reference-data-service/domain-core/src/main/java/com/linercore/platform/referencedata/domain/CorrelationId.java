package com.linercore.platform.referencedata.domain;

import java.util.UUID;

public record CorrelationId(String value) {
    public CorrelationId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("correlation id is required");
        }
    }

    public static CorrelationId existingOrNew(String value) {
        return value == null || value.isBlank()
                ? new CorrelationId(UUID.randomUUID().toString())
                : new CorrelationId(value);
    }
}
