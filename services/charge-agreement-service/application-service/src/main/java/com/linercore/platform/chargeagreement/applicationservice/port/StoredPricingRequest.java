package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import java.time.Instant;

public record StoredPricingRequest(
        String idempotencyKey,
        String bookingRef,
        int amendmentSeq,
        String requestHash,
        PricingRequestStatus status,
        String ownerToken,
        Instant leaseUntil,
        PricingResult result,
        String terminalCode,
        String correlationId,
        Instant startedAt,
        Instant completedAt) {
}
