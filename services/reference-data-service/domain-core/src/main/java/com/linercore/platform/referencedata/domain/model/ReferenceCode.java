package com.linercore.platform.referencedata.domain.model;

public record ReferenceCode(String value) {
    public ReferenceCode {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("reference code is required");
        }
    }
}
