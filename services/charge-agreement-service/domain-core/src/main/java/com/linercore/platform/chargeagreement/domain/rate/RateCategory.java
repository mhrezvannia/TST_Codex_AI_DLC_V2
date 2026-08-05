package com.linercore.platform.chargeagreement.domain.rate;

public enum RateCategory {
    BASE("OFR"),
    SURCHARGE("BAF"),
    LOCAL("THC");

    private final String requiredChargeCode;

    RateCategory(String requiredChargeCode) {
        this.requiredChargeCode = requiredChargeCode;
    }

    public String requiredChargeCode() {
        return requiredChargeCode;
    }

    public void requireChargeCode(String chargeCode) {
        if (!requiredChargeCode.equals(chargeCode)) {
            throw new IllegalArgumentException(
                    "charge code " + requiredChargeCode + " is required for " + name());
        }
    }
}
