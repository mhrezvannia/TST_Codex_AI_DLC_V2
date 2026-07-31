package com.linercore.platform.chargeagreement.applicationservice.port;

import java.time.Instant;
import java.util.Objects;

public record StoredPricingReceipt(
        String idempotencyKey,
        String bookingRef,
        int amendmentSeq,
        String requestHash,
        PricingRequestStatus status,
        String ownerToken,
        Instant leaseUntil,
        String correlationId,
        Instant startedAt,
        PricingTerminalReceipt terminal) {

    public StoredPricingReceipt {
        Objects.requireNonNull(status, "pricing request status is required");
        if (status == PricingRequestStatus.IN_PROGRESS && terminal != null) {
            throw new IllegalArgumentException("in-progress receipt cannot have a terminal");
        }
        if (status != PricingRequestStatus.IN_PROGRESS && terminal == null) {
            throw new IllegalArgumentException("terminal receipt is incomplete");
        }
    }
}
