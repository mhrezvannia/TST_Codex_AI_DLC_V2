package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;

public record MoneyAmount(BigDecimal amount, ReferenceId currencyId) {
    public MoneyAmount {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("charge amount must be greater than zero");
        }
        if (currencyId == null) {
            throw new IllegalArgumentException("currency id is required");
        }
    }
}
