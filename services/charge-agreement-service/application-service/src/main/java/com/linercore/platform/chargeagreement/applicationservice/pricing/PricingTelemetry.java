package com.linercore.platform.chargeagreement.applicationservice.pricing;

/**
 * Low-cardinality operation telemetry. The boundary accepts enums and duration
 * only, so business identifiers, payloads, hashes, tokens, and money cannot
 * become labels or log values.
 */
@FunctionalInterface
public interface PricingTelemetry {
    PricingTelemetry NOOP = signal -> {
    };

    void record(Signal signal);

    record Signal(
            Operation operation,
            Outcome outcome,
            Basis basis,
            ManualReason manualReason,
            long durationNanos) {
        public Signal {
            if (operation == null || outcome == null || basis == null || manualReason == null) {
                throw new IllegalArgumentException("telemetry dimensions are required");
            }
            if (durationNanos < 0) {
                throw new IllegalArgumentException("telemetry duration must not be negative");
            }
        }
    }

    enum Operation {
        PRICING_REQUEST,
        MANUAL_LIST,
        MANUAL_DETAIL
    }

    enum Outcome {
        PRICED,
        MANUAL,
        REPLAY,
        CONFLICT,
        IN_PROGRESS,
        TAKEOVER,
        STALE_OWNER,
        CASE_REUSE,
        ALLOWED,
        DENIED,
        NOT_FOUND,
        VALIDATION,
        UNAVAILABLE
    }

    enum Basis {
        AGREEMENT,
        TARIFF,
        NONE,
        UNKNOWN
    }

    enum ManualReason {
        NO_RATE,
        AMBIGUOUS_AGREEMENT_AUTHORITY,
        AMBIGUOUS_BASE_RATE,
        AMBIGUOUS_SURCHARGE_RATE,
        AMBIGUOUS_LOCAL_RATE,
        NONE
    }
}
