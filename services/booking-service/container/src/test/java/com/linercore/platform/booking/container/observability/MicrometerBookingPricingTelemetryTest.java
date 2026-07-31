package com.linercore.platform.booking.container.observability;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.booking.applicationservice.pricing.BookingPricingTelemetry;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class MicrometerBookingPricingTelemetryTest {
    @Test
    void recordsOnlyTheApprovedBoundedTagSet() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        MicrometerBookingPricingTelemetry telemetry = new MicrometerBookingPricingTelemetry(registry);

        telemetry.record(observation());

        var timer = registry.find(MicrometerBookingPricingTelemetry.METER_NAME).timer();
        assertEquals(1, timer.count());
        assertEquals(
                Set.of("operation", "outcome", "basis", "retry", "circuit", "receipt"),
                timer.getId().getTags().stream().map(tag -> tag.getKey()).collect(Collectors.toSet()));
    }

    @Test
    void cannotExposeCorrelationBookingMoneyKeysTokensOrVersionIds() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        new MicrometerBookingPricingTelemetry(registry).record(observation());

        String meters = registry.getMeters().stream()
                .map(meter -> meter.getId().toString())
                .collect(Collectors.joining("\n"));

        for (String forbidden : Set.of(
                "booking-123", "corr-secret", "idem-secret", "owner-secret",
                "service-token", "100.00", "agreement-version-1", "request-hash")) {
            assertFalse(meters.contains(forbidden));
        }
    }

    @Test
    void rejectsIncompleteOrNegativeObservations() {
        assertThrows(IllegalArgumentException.class, () -> new BookingPricingTelemetry.Observation(
                null,
                BookingPricingOutcome.PRICED,
                BookingPricingTelemetry.Basis.AGREEMENT,
                BookingPricingTelemetry.Retry.NONE,
                BookingPricingTelemetry.Circuit.CLOSED,
                BookingPricingTelemetry.Receipt.CLAIMED,
                Duration.ZERO));
        assertThrows(IllegalArgumentException.class, () -> new BookingPricingTelemetry.Observation(
                BookingPricingTelemetry.Operation.FIRST_PRICE,
                BookingPricingOutcome.PRICED,
                BookingPricingTelemetry.Basis.AGREEMENT,
                BookingPricingTelemetry.Retry.NONE,
                BookingPricingTelemetry.Circuit.CLOSED,
                BookingPricingTelemetry.Receipt.CLAIMED,
                Duration.ofNanos(-1)));
    }

    private BookingPricingTelemetry.Observation observation() {
        return new BookingPricingTelemetry.Observation(
                BookingPricingTelemetry.Operation.REPRICE,
                BookingPricingOutcome.PRICED,
                BookingPricingTelemetry.Basis.AGREEMENT,
                BookingPricingTelemetry.Retry.RETRIED,
                BookingPricingTelemetry.Circuit.CLOSED,
                BookingPricingTelemetry.Receipt.TAKEOVER,
                Duration.ofMillis(25));
    }
}
