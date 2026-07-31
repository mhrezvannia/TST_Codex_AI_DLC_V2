package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.LegacyPricingOutcome;
import java.time.Instant;

public record StoredLegacyPricingRequest(
        String idempotencyKey,
        String bookingRef,
        int amendmentSeq,
        String requestHash,
        PricingRequestStatus status,
        String ownerToken,
        Instant leaseUntil,
        LegacyPricingOutcome outcome,
        String terminalCode,
        String correlationId,
        Instant startedAt,
        Instant completedAt) {
}
