package com.linercore.platform.referencedata.domain.model;

public record ReferenceId(String value) {
    public ReferenceId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("reference id is required");
        }
    }
}
