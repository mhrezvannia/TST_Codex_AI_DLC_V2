package com.linercore.platform.chargeagreement.domain.agreement;

public record AgreementVersionId(String value) {
    public AgreementVersionId {
        AgreementId.requireIdentifier(value, "agreement version id");
    }
}
