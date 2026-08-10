package com.linercore.platform.booking.applicationservice.pricing;

public class ChargePricingClientException extends RuntimeException {
    private final ChargePricingFailureType failureType;
    private final String reasonCode;

    public ChargePricingClientException(ChargePricingFailureType failureType, String reasonCode, String message) {
        super(message);
        if (failureType == null) {
            throw new IllegalArgumentException("failure type is required");
        }
        this.failureType = failureType;
        this.reasonCode = reasonCode;
    }

    public ChargePricingFailureType failureType() {
        return failureType;
    }

    public String reasonCode() {
        return reasonCode;
    }
}
