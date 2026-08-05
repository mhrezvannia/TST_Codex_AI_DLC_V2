package com.linercore.platform.chargeagreement.container;

import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingTelemetry;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

public final class MicrometerPricingTelemetry implements PricingTelemetry {
    private final MeterRegistry registry;

    public MicrometerPricingTelemetry(MeterRegistry registry) {
        this.registry = Objects.requireNonNull(registry);
    }

    @Override
    public void record(Signal signal) {
        Timer.builder("linercore.charge.pricing.operation")
                .description("Bounded Charge pricing and manual-evidence operation latency")
                .tag("operation", signal.operation().name())
                .tag("outcome", signal.outcome().name())
                .tag("basis", signal.basis().name())
                .tag("manual_reason", signal.manualReason().name())
                .register(registry)
                .record(signal.durationNanos(), TimeUnit.NANOSECONDS);
    }
}
