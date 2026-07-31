package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.PricingFailureEvidence;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class BookingPricingResilienceTest {
    private static final Instant NOW = Instant.parse("2026-07-29T10:00:00Z");

    @Test
    void timeoutRetriesExactlyOnceWithSameLogicalOperation() {
        BookingPricingResilience resilience = resilience();
        AtomicInteger calls = new AtomicInteger();

        resilience.execute(() -> {
            calls.incrementAndGet();
            return outage("TIMEOUT");
        }, "corr-1");

        assertEquals(2, calls.get());
    }

    @Test
    void unavailableRetriesExactlyOnce() {
        BookingPricingResilience resilience = resilience();
        AtomicInteger calls = new AtomicInteger();

        resilience.execute(() -> {
            calls.incrementAndGet();
            return outage("SERVICE_UNAVAILABLE");
        }, "corr-1");

        assertEquals(2, calls.get());
    }

    @Test
    void domainAndFourHundredClassOutcomesAreNotRetried() {
        BookingPricingResilience resilience = resilience();
        AtomicInteger calls = new AtomicInteger();

        resilience.execute(() -> {
            calls.incrementAndGet();
            return new PricingPortResult.Denied("SERVICE_IDENTITY_DENIED", "corr-1");
        }, "corr-1");

        assertEquals(1, calls.get());
        assertEquals(CircuitBreaker.State.CLOSED, resilience.state());
    }

    @Test
    void fivePostRetryFailuresOpenCircuit() {
        BookingPricingResilience resilience = resilience();
        for (int operation = 0; operation < 5; operation++) {
            resilience.execute(() -> outage("TIMEOUT"), "corr-1");
        }

        assertEquals(CircuitBreaker.State.OPEN, resilience.state());
    }

    @Test
    void openCircuitReturnsDurableThirtySecondProbeTimeWithoutCallingRaw() {
        BookingPricingResilience resilience = resilience();
        for (int operation = 0; operation < 5; operation++) {
            resilience.execute(() -> outage("TIMEOUT"), "corr-1");
        }
        AtomicInteger calls = new AtomicInteger();

        PricingPortResult result = resilience.execute(() -> {
            calls.incrementAndGet();
            return outage("TIMEOUT");
        }, "corr-1");

        assertEquals(0, calls.get());
        assertEquals(NOW.plusSeconds(30), ((PricingPortResult.Outage) result).nextProbeAt());
    }

    @Test
    void dueProjectionKeepsBookingChangedImmediateAndBoundsProbeContention() {
        PricingCommandResult changed = new PricingCommandResult(
                BookingPricingOutcome.BOOKING_CHANGED, null, 0, "a".repeat(64),
                null, null, evidence("BOOKING_CHANGED", null), 0, "corr-1");

        assertEquals(null, PricingDueProjection.nextAttemptAt(changed, NOW, null));
        assertEquals(NOW.plusSeconds(5), PricingDueProjection.occupiedProbeDue(NOW));
    }

    @Test
    void circuitOpenDueUsesRecordedProbeTime() {
        PricingCommandResult open = new PricingCommandResult(
                BookingPricingOutcome.CIRCUIT_OPEN, null, 0, "a".repeat(64),
                null, null, evidence("CIRCUIT_OPEN", NOW.plusSeconds(30)), 0, "corr-1");

        assertEquals(NOW.plusSeconds(30), PricingDueProjection.nextAttemptAt(open, NOW, null));
        assertTrue(PricingDueProjection.isRetryable(open.outcome()));
    }

    private static BookingPricingResilience resilience() {
        return new BookingPricingResilience(Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static PricingPortResult outage(String reason) {
        return new PricingPortResult.Outage(reason, 2, "CLOSED", null, "corr-1");
    }

    private static PricingFailureEvidence evidence(String reason, Instant nextProbe) {
        return new PricingFailureEvidence(
                reason, reason, null, null, 0, "OPEN", nextProbe, "corr-1", NOW, 0);
    }
}
