package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;

public record DndRule(
        String ruleId,
        int freeDays,
        MoneyAmount dailyRate) {
    public DndRule {
        if (freeDays < 0) {
            throw new IllegalArgumentException("free days cannot be negative");
        }
    }

    public MoneyAmount chargeableAmount(int elapsedDays) {
        int chargeableDays = Math.max(0, elapsedDays - freeDays);
        BigDecimal amount = dailyRate.amount().multiply(BigDecimal.valueOf(chargeableDays));
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return new MoneyAmount(amount, dailyRate.currencyId());
    }
}
