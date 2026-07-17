package com.linercore.platform.chargeagreement.applicationservice;

import java.time.Duration;

public class PricingRequestInProgressException extends RuntimeException {
    private final Duration retryAfter;

    public PricingRequestInProgressException(Duration retryAfter) {
        super("pricing request is already in progress");
        this.retryAfter = retryAfter;
    }

    public Duration retryAfter() {
        return retryAfter;
    }
}
