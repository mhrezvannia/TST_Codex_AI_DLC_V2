package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;

public record PricingLine(
        String chargeTermId,
        ReferenceId chargeCodeId,
        ChargeBasis basis,
        int quantity,
        MoneyAmount rate,
        MoneyAmount amount) {
    public PricingLine {
        if (quantity <= 0) {
            throw new IllegalArgumentException("pricing quantity must be positive");
        }
        BigDecimal expected = rate.amount().multiply(BigDecimal.valueOf(quantity));
        if (amount.amount().compareTo(expected) != 0) {
            throw new IllegalArgumentException("pricing amount must equal rate times quantity");
        }
    }
}
