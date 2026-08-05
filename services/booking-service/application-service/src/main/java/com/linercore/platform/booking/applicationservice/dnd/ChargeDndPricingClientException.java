package com.linercore.platform.booking.applicationservice.dnd;

public class ChargeDndPricingClientException extends RuntimeException {
    private final ChargeDndPricingFailureType failureType;
    private final String reasonCode;

    public ChargeDndPricingClientException(ChargeDndPricingFailureType failureType, String reasonCode, String message) {
        super(message);
        this.failureType = failureType;
        this.reasonCode = reasonCode;
    }

    public ChargeDndPricingFailureType failureType() {
        return failureType;
    }

    public String reasonCode() {
        return reasonCode;
    }
}
