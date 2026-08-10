package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.time.Instant;

public sealed interface PricingPortResult
        permits PricingPortResult.Priced,
                PricingPortResult.LegacyPriced,
                PricingPortResult.ManualRequired,
                PricingPortResult.Outage,
                PricingPortResult.Denied,
                PricingPortResult.Validation,
                PricingPortResult.Malformed,
                PricingPortResult.Conflict,
                PricingPortResult.InProgress {
    String reasonCode();

    String correlationId();

    record Priced(BookingPricingSnapshot snapshot) implements PricingPortResult {
        @Override
        public String reasonCode() {
            return "PRICED";
        }

        @Override
        public String correlationId() {
            return snapshot.correlationId();
        }
    }

    record LegacyPriced(PricingSnapshot snapshot) implements PricingPortResult {
        @Override
        public String reasonCode() {
            return "LEGACY_PRICED";
        }

        @Override
        public String correlationId() {
            return snapshot.correlationId();
        }
    }

    record ManualRequired(
            String reasonCode,
            String pricingRequestId,
            String manualCaseId,
            String correlationId,
            String providerEvidence) implements PricingPortResult {}

    record Outage(
            String reasonCode,
            int attempts,
            String circuitState,
            Instant nextProbeAt,
            String correlationId) implements PricingPortResult {}

    record Denied(String reasonCode, String correlationId) implements PricingPortResult {}

    record Validation(String reasonCode, String correlationId) implements PricingPortResult {}

    record Malformed(String reasonCode, String correlationId) implements PricingPortResult {}

    record Conflict(String reasonCode, String correlationId) implements PricingPortResult {}

    record InProgress(String reasonCode, int retryAfterSeconds, String correlationId)
            implements PricingPortResult {
        public InProgress {
            if (retryAfterSeconds < 1 || retryAfterSeconds > 30) {
                throw new IllegalArgumentException("retry-after must be between 1 and 30 seconds");
            }
        }
    }
}
