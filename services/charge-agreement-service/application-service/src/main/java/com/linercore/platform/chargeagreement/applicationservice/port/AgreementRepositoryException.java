package com.linercore.platform.chargeagreement.applicationservice.port;

public final class AgreementRepositoryException extends RuntimeException {
    private final String code;

    public AgreementRepositoryException(String code, String message) {
        super(message);
        this.code = code;
    }

    public AgreementRepositoryException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
