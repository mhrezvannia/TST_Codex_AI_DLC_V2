package com.linercore.platform.chargeagreement.domain.pricing;

public enum PricingTerminalReason {
    NO_RATE(404, "NO_RATE"),
    AMBIGUOUS_AGREEMENT_AUTHORITY(422, "PRICING_VALIDATION"),
    AMBIGUOUS_BASE_RATE(422, "PRICING_VALIDATION"),
    AMBIGUOUS_SURCHARGE_RATE(422, "PRICING_VALIDATION"),
    AMBIGUOUS_LOCAL_RATE(422, "PRICING_VALIDATION");

    private final int httpStatus;
    private final String publicCode;

    PricingTerminalReason(int httpStatus, String publicCode) {
        this.httpStatus = httpStatus;
        this.publicCode = publicCode;
    }

    public int httpStatus() {
        return httpStatus;
    }

    public String publicCode() {
        return publicCode;
    }
}
