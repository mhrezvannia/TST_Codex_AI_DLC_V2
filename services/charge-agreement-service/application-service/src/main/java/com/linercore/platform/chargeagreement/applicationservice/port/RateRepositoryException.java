package com.linercore.platform.chargeagreement.applicationservice.port;

public final class RateRepositoryException extends RuntimeException {
    private final String code;

    public RateRepositoryException(String code, String message) {
        super(message);
        this.code = code;
    }

    public RateRepositoryException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
