package com.linercore.platform.booking.applicationservice.port;

import java.time.Duration;

public final class ReferenceProviderUnavailable extends RuntimeException {
    private final ReferenceProviderFailureCategory category;
    private final String correlationId;
    private final Duration retryAfter;

    public ReferenceProviderUnavailable(
            ReferenceProviderFailureCategory category,
            String message,
            String correlationId,
            Duration retryAfter) {
        super(message);
        this.category = category;
        this.correlationId = correlationId;
        this.retryAfter = retryAfter;
    }

    public ReferenceProviderFailureCategory category() {
        return category;
    }

    public String correlationId() {
        return correlationId;
    }

    public Duration retryAfter() {
        return retryAfter;
    }
}
