package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.function.Supplier;

/**
 * Process-local resilience state. Restarting the Booking process resets the circuit.
 */
public final class BookingPricingResilience {
    private final Retry retry;
    private final CircuitBreaker circuit;
    private final Clock clock;

    public BookingPricingResilience(Clock clock) {
        this.clock = clock;
        RetryConfig<PricingPortResult> retryConfig = RetryConfig.<PricingPortResult>custom()
                .maxAttempts(2)
                .waitDuration(Duration.ZERO)
                .retryOnResult(BookingPricingResilience::isTimeoutOrUnavailable)
                .retryOnException(exception -> false)
                .failAfterMaxAttempts(false)
                .build();
        CircuitBreakerConfig circuitConfig = CircuitBreakerConfig.custom()
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(5)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(100.0f)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(1)
                .recordResult(BookingPricingResilience::isTimeoutOrUnavailable)
                .recordException(exception -> false)
                .build();
        this.retry = Retry.of("booking-charge-pricing", retryConfig);
        this.circuit = CircuitBreaker.of("booking-charge-pricing", circuitConfig);
    }

    public PricingPortResult execute(Supplier<PricingPortResult> rawCall, String correlationId) {
        Supplier<PricingPortResult> retried = Retry.decorateSupplier(retry, rawCall);
        Supplier<PricingPortResult> guarded = CircuitBreaker.decorateSupplier(circuit, retried);
        try {
            return guarded.get();
        } catch (CallNotPermittedException exception) {
            return new PricingPortResult.Outage(
                    "CIRCUIT_OPEN",
                    0,
                    circuit.getState().name(),
                    Instant.now(clock).plusSeconds(30),
                    correlationId);
        }
    }

    public CircuitBreaker.State state() {
        return circuit.getState();
    }

    private static boolean isTimeoutOrUnavailable(Object result) {
        if (!(result instanceof PricingPortResult.Outage outage)) {
            return false;
        }
        return "TIMEOUT".equals(outage.reasonCode())
                || "SERVICE_UNAVAILABLE".equals(outage.reasonCode())
                || "PRICING_UNAVAILABLE".equals(outage.reasonCode())
                || "CHARGE_UNAVAILABLE".equals(outage.reasonCode());
    }
}
