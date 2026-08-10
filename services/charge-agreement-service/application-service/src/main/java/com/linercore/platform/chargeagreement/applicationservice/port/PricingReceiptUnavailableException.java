package com.linercore.platform.chargeagreement.applicationservice.port;

public final class PricingReceiptUnavailableException extends RuntimeException {
    public PricingReceiptUnavailableException(String message) {
        super(message);
    }

    public PricingReceiptUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
