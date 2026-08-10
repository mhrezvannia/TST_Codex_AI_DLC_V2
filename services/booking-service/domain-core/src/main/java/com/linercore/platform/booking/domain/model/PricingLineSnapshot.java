package com.linercore.platform.booking.domain.model;

import java.math.BigDecimal;

public record PricingLineSnapshot(
        String chargeCode,
        String category,
        String rateCategory,
        String basis,
        int quantity,
        BigDecimal unitRate,
        BigDecimal amount,
        String currency,
        String sourceRateVersionId) {
    public PricingLineSnapshot {
        chargeCode = required(chargeCode, "charge code");
        category = oneOf(category, "category", "FREIGHT", "SURCHARGE", "LOCAL");
        rateCategory = oneOf(rateCategory, "rate category", "BASE", "SURCHARGE", "LOCAL");
        basis = oneOf(basis, "basis", "PER_CONTAINER");
        if (quantity < 1) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        unitRate = money(unitRate, "unit rate");
        amount = money(amount, "amount");
        currency = oneOf(currency, "currency", "USD");
        sourceRateVersionId = required(sourceRateVersionId, "source rate version id");
    }

    private static BigDecimal money(BigDecimal value, String label) {
        if (value == null || value.signum() < 0 || value.scale() > 2) {
            throw new IllegalArgumentException(label + " must be a non-negative decimal with scale <= 2");
        }
        return value;
    }

    private static String oneOf(String value, String label, String... allowed) {
        String candidate = required(value, label);
        for (String option : allowed) {
            if (option.equals(candidate)) {
                return candidate;
            }
        }
        throw new IllegalArgumentException(label + " is unsupported");
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}
