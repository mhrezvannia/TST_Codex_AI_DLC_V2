package com.linercore.platform.chargeagreement.domain.model;

import java.util.Objects;

/**
 * Compatibility outcome for the pre-W2 administration service. The active U04 provider uses
 * {@code PricingResolution} and exact HTTP terminal receipts instead.
 */
public sealed interface LegacyPricingOutcome
        permits LegacyPricingOutcome.Automatic, LegacyPricingOutcome.Manual {

    record Automatic(PricingResult result) implements LegacyPricingOutcome {
        public Automatic {
            Objects.requireNonNull(result, "automatic pricing result is required");
        }
    }

    record Manual(String pricingRequestId, String reasonCode, String correlationId)
            implements LegacyPricingOutcome {
        public Manual {
            pricingRequestId = required(pricingRequestId, "pricing request id");
            reasonCode = required(reasonCode, "manual pricing reason");
            correlationId = required(correlationId, "correlation id");
        }
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}
