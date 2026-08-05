package com.linercore.platform.booking.applicationservice;

public class IdempotencyConflictException extends IllegalStateException {
    public IdempotencyConflictException() {
        super("idempotency key was already used for a different request");
    }
}
