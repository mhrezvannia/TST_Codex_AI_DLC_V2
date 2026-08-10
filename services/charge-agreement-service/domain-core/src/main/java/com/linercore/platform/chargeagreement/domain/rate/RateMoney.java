package com.linercore.platform.chargeagreement.domain.rate;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record RateMoney(BigDecimal amount, ReferenceId currencyId, String currencyCode) {
    public RateMoney {
        Objects.requireNonNull(amount, "unit rate is required");
        Objects.requireNonNull(currencyId, "currency id is required");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("unit rate must be non-negative");
        }
        if (amount.scale() > 2) {
            throw new IllegalArgumentException("unit rate must have no more than two decimal places");
        }
        if (!"USD".equals(currencyCode)) {
            throw new IllegalArgumentException("currency must be USD");
        }
        amount = amount.setScale(2, RoundingMode.UNNECESSARY);
    }
}
