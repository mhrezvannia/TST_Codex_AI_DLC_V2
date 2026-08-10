package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import java.time.Duration;

/**
 * A deliberately identifier-free telemetry boundary. Only bounded enums and elapsed time can cross it.
 */
@FunctionalInterface
public interface BookingPricingTelemetry {
    void record(Observation observation);

    static BookingPricingTelemetry noop() {
        return observation -> {
        };
    }

    enum Operation {
        FIRST_PRICE,
        REPRICE
    }

    enum Basis {
        AGREEMENT,
        TARIFF,
        NONE
    }

    enum Retry {
        NONE,
        RETRIED
    }

    enum Circuit {
        CLOSED,
        OPEN,
        UNKNOWN
    }

    enum Receipt {
        CLAIMED,
        REPLAY,
        IN_PROGRESS,
        CONFLICT,
        TAKEOVER,
        STALE_OWNER,
        BOOKING_CHANGED
    }

    record Observation(
            Operation operation,
            BookingPricingOutcome outcome,
            Basis basis,
            Retry retry,
            Circuit circuit,
            Receipt receipt,
            Duration elapsed) {
        public Observation {
            if (operation == null || outcome == null || basis == null || retry == null
                    || circuit == null || receipt == null || elapsed == null || elapsed.isNegative()) {
                throw new IllegalArgumentException("bounded pricing telemetry fields are required");
            }
        }
    }
}
