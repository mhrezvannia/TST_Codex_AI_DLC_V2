package com.linercore.platform.chargeagreement.domain.model;

import java.util.Locale;

public record AgreementNumber(String value) {
    public AgreementNumber {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("agreement number is required");
        }
        value = value.trim().toUpperCase(Locale.ROOT);
    }
}
