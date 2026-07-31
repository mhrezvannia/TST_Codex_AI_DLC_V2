package com.linercore.platform.chargeagreement.domain.agreement;

public record AgreementId(String value) {
    public AgreementId {
        requireIdentifier(value, "agreement id");
    }

    static void requireIdentifier(String value, String field) {
        if (value == null || value.isBlank() || value.length() > 64) {
            throw new IllegalArgumentException(field + " is required and must not exceed 64 characters");
        }
    }
}
