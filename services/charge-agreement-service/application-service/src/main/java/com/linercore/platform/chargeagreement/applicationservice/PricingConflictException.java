package com.linercore.platform.chargeagreement.applicationservice;

public class PricingConflictException extends RuntimeException {
    private final String code;

    public PricingConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
