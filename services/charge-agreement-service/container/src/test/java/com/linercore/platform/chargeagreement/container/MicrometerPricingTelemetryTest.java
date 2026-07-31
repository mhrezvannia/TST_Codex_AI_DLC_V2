package com.linercore.platform.chargeagreement.container;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingTelemetry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.List;
import org.junit.jupiter.api.Test;

class MicrometerPricingTelemetryTest {

    @Test
    void publishesOnlyFiniteEnumDimensionsAndNeverSensitiveValues() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        new MicrometerPricingTelemetry(registry).record(new PricingTelemetry.Signal(
                PricingTelemetry.Operation.PRICING_REQUEST,
                PricingTelemetry.Outcome.MANUAL,
                PricingTelemetry.Basis.NONE,
                PricingTelemetry.ManualReason.NO_RATE,
                42));

        var timer = registry.get("linercore.charge.pricing.operation").timer();
        assertEquals(1L, timer.count());
        assertEquals("PRICING_REQUEST", timer.getId().getTag("operation"));
        assertEquals("MANUAL", timer.getId().getTag("outcome"));
        assertEquals("NONE", timer.getId().getTag("basis"));
        assertEquals("NO_RATE", timer.getId().getTag("manual_reason"));
        String meter = timer.getId().toString();
        for (String forbidden : List.of(
                "customer-123", "party-123", "BK-123", "request-payload",
                "0123456789abcdef", "idempotency-key-123", "owner-token-123",
                "rate-version-123", "125.50", "authorization-token",
                "case-snapshot", "case-123")) {
            assertFalse(meter.toLowerCase().contains(forbidden));
        }
    }
}
