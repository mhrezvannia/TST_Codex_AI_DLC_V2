package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.applicationservice.pricing.PricingAttempt;
import java.time.Instant;

public interface PricingPort {
    PricingRequestResult requestPricing(Booking booking, String idempotencyKey, String correlationId);

    default PricingPortResult requestPricing(PricingAttempt attempt) {
        PricingRequestResult result =
                requestPricing(attempt.booking(), attempt.providerKey(), attempt.correlationId());
        return switch (result.outcome()) {
            case PRICED -> new PricingPortResult.LegacyPriced(new PricingSnapshot(
                    result.pricingRequestId(),
                    result.pricingQuoteId(),
                    "QUOTED",
                    result.quotedAmounts(),
                    Instant.EPOCH,
                    result.correlationId()));
            case PENDING -> new PricingPortResult.InProgress(
                    "PRICING_IN_PROGRESS", 5, result.correlationId());
            case MANUAL_REQUIRED -> isManualReason(result.reasonCode())
                    ? new PricingPortResult.ManualRequired(
                            result.reasonCode(),
                            result.pricingRequestId(),
                            null,
                            result.correlationId(),
                            result.reasonMessage())
                    : new PricingPortResult.Validation(result.reasonCode(), result.correlationId());
            case TRANSIENT_FAILURE -> new PricingPortResult.Outage(
                    result.reasonCode(), 1, "CLOSED", null, result.correlationId());
            case DENIED -> new PricingPortResult.Denied(result.reasonCode(), result.correlationId());
            case VALIDATION_FAILED ->
                new PricingPortResult.Validation(result.reasonCode(), result.correlationId());
        };
    }

    private static boolean isManualReason(String reasonCode) {
        return "NO_RATE".equals(reasonCode)
                || "AMBIGUOUS_AGREEMENT_AUTHORITY".equals(reasonCode)
                || "AMBIGUOUS_BASE_RATE".equals(reasonCode)
                || "AMBIGUOUS_SURCHARGE_RATE".equals(reasonCode)
                || "AMBIGUOUS_LOCAL_RATE".equals(reasonCode);
    }
}
