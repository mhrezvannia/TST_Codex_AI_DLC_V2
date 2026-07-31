package com.linercore.platform.chargeagreement.domain.rate;

public record RateVersionId(String value) {
    public RateVersionId {
        value = RateId.requireIdentifier(value, "rate version id");
    }
}
