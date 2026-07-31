package com.linercore.platform.containermovement.applicationservice;

public class MovementConflictException extends RuntimeException {
    private final String code;
    private final String current;
    private final String requiredNext;
    private final String correlationId;

    public MovementConflictException(
            String code,
            String message,
            String current,
            String requiredNext,
            String correlationId) {
        super(message);
        this.code = code;
        this.current = current;
        this.requiredNext = requiredNext;
        this.correlationId = correlationId;
    }

    public String code() {
        return code;
    }

    public String current() {
        return current;
    }

    public String requiredNext() {
        return requiredNext;
    }

    public String correlationId() {
        return correlationId;
    }
}
