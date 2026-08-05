package com.linercore.platform.chargeagreement.applicationservice.port;

public class EventPublicationException extends RuntimeException {
    private final String code;
    private final boolean retryable;

    public EventPublicationException(String code, String message, boolean retryable) {
        super(message);
        this.code = code;
        this.retryable = retryable;
    }

    public String code() {
        return code;
    }

    public boolean retryable() {
        return retryable;
    }
}
