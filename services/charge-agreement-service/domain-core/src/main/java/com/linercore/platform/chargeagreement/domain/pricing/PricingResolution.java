package com.linercore.platform.chargeagreement.domain.pricing;

import java.util.Objects;

public sealed interface PricingResolution
        permits PricingResolution.Priced, PricingResolution.Manual, PricingResolution.Unavailable {

    record Priced(ResolvedPricingAuthority authority) implements PricingResolution {
        public Priced {
            Objects.requireNonNull(authority, "pricing authority is required");
        }
    }

    record Manual(PricingTerminalReason reason) implements PricingResolution {
        public Manual {
            Objects.requireNonNull(reason, "manual pricing reason is required");
        }
    }

    record Unavailable(String reason) implements PricingResolution {
        public Unavailable {
            if (reason == null || reason.isBlank()) {
                throw new IllegalArgumentException("unavailable reason is required");
            }
        }
    }
}
