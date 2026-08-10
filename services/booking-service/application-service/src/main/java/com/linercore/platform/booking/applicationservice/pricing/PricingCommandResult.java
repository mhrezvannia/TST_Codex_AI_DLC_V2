package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingFailureEvidence;
import com.linercore.platform.booking.domain.model.PricingSnapshot;

public record PricingCommandResult(
        BookingPricingOutcome outcome,
        String pricingRequestId,
        int amendmentSeq,
        String inputFingerprint,
        BookingPricingSnapshot typedSnapshot,
        PricingSnapshot legacySnapshot,
        PricingFailureEvidence failureEvidence,
        int retryAfterSeconds,
        String correlationId) {
    public PricingCommandResult {
        if (outcome == null || amendmentSeq < 0) {
            throw new IllegalArgumentException("pricing outcome and non-negative sequence are required");
        }
        if (inputFingerprint == null || !inputFingerprint.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException("pricing input fingerprint must be lowercase SHA-256");
        }
        int evidenceCount = (typedSnapshot == null ? 0 : 1)
                + (legacySnapshot == null ? 0 : 1)
                + (failureEvidence == null ? 0 : 1);
        if (evidenceCount > 1) {
            throw new IllegalArgumentException("pricing command result contains conflicting evidence");
        }
        if (outcome == BookingPricingOutcome.PRICED && typedSnapshot == null) {
            throw new IllegalArgumentException("priced result requires typed snapshot");
        }
        if (outcome == BookingPricingOutcome.LEGACY_PRICED && legacySnapshot == null) {
            throw new IllegalArgumentException("legacy-priced result requires legacy snapshot");
        }
        if (retryAfterSeconds < 0 || retryAfterSeconds > 30) {
            throw new IllegalArgumentException("retry-after must be between zero and 30 seconds");
        }
    }

    public boolean confirmationEligible() {
        return outcome == BookingPricingOutcome.PRICED;
    }
}
