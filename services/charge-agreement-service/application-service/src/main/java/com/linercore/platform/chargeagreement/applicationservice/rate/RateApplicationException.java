package com.linercore.platform.chargeagreement.applicationservice.rate;

import java.util.List;

public final class RateApplicationException extends RuntimeException {
    private final int status;
    private final String code;
    private final List<FieldError> fieldErrors;

    public RateApplicationException(int status, String code, String message) {
        this(status, code, message, List.of());
    }

    public RateApplicationException(int status, String code, String message, List<FieldError> fieldErrors) {
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = List.copyOf(fieldErrors);
    }

    public int status() {
        return status;
    }

    public String code() {
        return code;
    }

    public List<FieldError> fieldErrors() {
        return fieldErrors;
    }

    public record FieldError(String field, String reason) {
    }
}
