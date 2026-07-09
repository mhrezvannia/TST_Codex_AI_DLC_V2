package com.linercore.platform.chargeagreement.domain.model;

public record AgreementId(String value) {
    public AgreementId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("agreement id is required");
        }
    }
}
