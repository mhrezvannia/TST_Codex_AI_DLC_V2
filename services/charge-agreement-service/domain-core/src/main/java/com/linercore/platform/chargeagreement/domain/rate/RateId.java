package com.linercore.platform.chargeagreement.domain.rate;

public record RateId(String value) {
    public RateId {
        value = requireIdentifier(value, "rate id");
    }

    static String requireIdentifier(String value, String field) {
        if (value == null || value.isBlank() || value.length() > 64) {
            throw new IllegalArgumentException(field + " is required and must not exceed 64 characters");
        }
        return value;
    }
}
