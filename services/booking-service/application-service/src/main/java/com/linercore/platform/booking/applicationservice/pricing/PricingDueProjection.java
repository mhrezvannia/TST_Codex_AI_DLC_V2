package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import java.time.Duration;
import java.time.Instant;

public final class PricingDueProjection {
    private PricingDueProjection() {}

    public static Instant nextAttemptAt(
            PricingCommandResult result,
            Instant databaseNow,
            Instant probeStartedAt) {
        return switch (result.outcome()) {
            case IN_PROGRESS -> databaseNow.plusSeconds(Math.max(1, result.retryAfterSeconds()));
            case TIMEOUT, UNAVAILABLE -> databaseNow.plusSeconds(5);
            case CIRCUIT_OPEN -> result.failureEvidence() != null
                            && result.failureEvidence().nextProbeAt() != null
                    ? result.failureEvidence().nextProbeAt()
                    : databaseNow.plusSeconds(30);
            case BOOKING_CHANGED -> null;
            default -> null;
        };
    }

    public static Instant occupiedProbeDue(Instant probeStartedAt) {
        if (probeStartedAt == null) {
            throw new IllegalArgumentException("probe start is required");
        }
        return probeStartedAt.plus(Duration.ofSeconds(5));
    }

    public static boolean isRetryable(BookingPricingOutcome outcome) {
        return outcome == BookingPricingOutcome.IN_PROGRESS
                || outcome == BookingPricingOutcome.TIMEOUT
                || outcome == BookingPricingOutcome.UNAVAILABLE
                || outcome == BookingPricingOutcome.CIRCUIT_OPEN
                || outcome == BookingPricingOutcome.BOOKING_CHANGED;
    }
}
