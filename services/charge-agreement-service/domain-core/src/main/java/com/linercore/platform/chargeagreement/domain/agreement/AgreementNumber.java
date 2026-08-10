package com.linercore.platform.chargeagreement.domain.agreement;

public record AgreementNumber(String value) {
    public AgreementNumber {
        AgreementId.requireIdentifier(value, "agreement number");
        value = value.trim();
    }
}
