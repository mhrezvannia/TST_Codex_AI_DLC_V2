package com.linercore.platform.booking.container.observability;

import com.linercore.platform.booking.applicationservice.pricing.BookingPricingTelemetry;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;

public final class MicrometerBookingPricingTelemetry implements BookingPricingTelemetry {
    static final String METER_NAME = "booking.pricing.operation";
    private final MeterRegistry registry;

    public MicrometerBookingPricingTelemetry(MeterRegistry registry) {
        this.registry = registry;
    }

    @Override
    public void record(Observation observation) {
        Tags tags = Tags.of(
                "operation", observation.operation().name(),
                "outcome", observation.outcome().name(),
                "basis", observation.basis().name(),
                "retry", observation.retry().name(),
                "circuit", observation.circuit().name(),
                "receipt", observation.receipt().name());
        registry.timer(METER_NAME, tags).record(observation.elapsed());
    }
}
