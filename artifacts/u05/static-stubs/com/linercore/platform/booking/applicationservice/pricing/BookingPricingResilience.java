package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import java.time.Clock;
import java.util.function.Supplier;

/**
 * Compile-only seam used when the approved Resilience4j artifacts are absent.
 * Production compilation uses the real source and dependencies.
 */
public final class BookingPricingResilience {
    public BookingPricingResilience(Clock clock) {}

    public PricingPortResult execute(
            Supplier<PricingPortResult> rawCall, String correlationId) {
        PricingPortResult first = rawCall.get();
        if (first instanceof PricingPortResult.Outage outage
                && ("TIMEOUT".equals(outage.reasonCode())
                        || "PRICING_UNAVAILABLE".equals(outage.reasonCode())
                        || "SERVICE_UNAVAILABLE".equals(outage.reasonCode())
                        || "CHARGE_UNAVAILABLE".equals(outage.reasonCode()))) {
            return rawCall.get();
        }
        return first;
    }
}
