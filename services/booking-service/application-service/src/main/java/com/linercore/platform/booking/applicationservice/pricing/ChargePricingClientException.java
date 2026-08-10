package com.linercore.platform.booking.applicationservice.pricing;

public class ChargePricingClientException extends RuntimeException {
    private final ChargePricingFailureType failureType;
    private final String reasonCode;
    private final String pricingRequestId;
    private final String manualCaseId;
    private final String correlationId;
    private final int retryAfterSeconds;

    public ChargePricingClientException(ChargePricingFailureType failureType, String reasonCode, String message) {
        this(failureType, reasonCode, message, null, null, null, 0);
    }

    public ChargePricingClientException(
            ChargePricingFailureType failureType,
            String reasonCode,
            String message,
            String pricingRequestId,
            String manualCaseId,
            String correlationId,
            int retryAfterSeconds) {
        super(message);
        if (failureType == null) {
            throw new IllegalArgumentException("failure type is required");
        }
        this.failureType = failureType;
        this.reasonCode = reasonCode;
        this.pricingRequestId = pricingRequestId;
        this.manualCaseId = manualCaseId;
        this.correlationId = correlationId;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public ChargePricingFailureType failureType() {
        return failureType;
    }

    public String reasonCode() {
        return reasonCode;
    }

    public String pricingRequestId() {
        return pricingRequestId;
    }

    public String manualCaseId() {
        return manualCaseId;
    }

    public String correlationId() {
        return correlationId;
    }

    public int retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
