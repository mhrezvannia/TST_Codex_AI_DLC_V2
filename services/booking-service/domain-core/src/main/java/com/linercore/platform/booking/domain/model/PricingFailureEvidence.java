package com.linercore.platform.booking.domain.model;

import java.time.Instant;

public record PricingFailureEvidence(
        String reasonCode,
        String reasonMessage,
        String pricingRequestId,
        String manualCaseId,
        int attempts,
        String circuitState,
        Instant nextProbeAt,
        String correlationId,
        Instant occurredAt,
        int amendmentSeq) {
    public PricingFailureEvidence {
        if (reasonCode == null || reasonCode.isBlank()) {
            throw new IllegalArgumentException("pricing failure reason code is required");
        }
        if (attempts < 0 || amendmentSeq < 0) {
            throw new IllegalArgumentException("attempts and amendment sequence must be non-negative");
        }
        if (correlationId == null || correlationId.isBlank() || occurredAt == null) {
            throw new IllegalArgumentException("correlation and occurrence time are required");
        }
    }
}
