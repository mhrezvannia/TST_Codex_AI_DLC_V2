package com.linercore.platform.booking.applicationservice.pricing;

import java.math.BigDecimal;

public record ChargePricingLineItem(
        String chargeCode,
        String category,
        BigDecimal amount,
        String currency,
        String rateCategory,
        String basis,
        Integer quantity,
        BigDecimal unitRate,
        String sourceRateVersionId) {

    public ChargePricingLineItem {
        if (chargeCode == null || chargeCode.isBlank()) {
            throw new IllegalArgumentException("charge code is required");
        }
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("category is required");
        }
        if (amount == null) {
            throw new IllegalArgumentException("amount is required");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("currency is required");
        }
    }

    public boolean hasAnyTypedEnrichment() {
        return rateCategory != null
                || basis != null
                || quantity != null
                || unitRate != null
                || sourceRateVersionId != null;
    }

    public boolean hasCompleteTypedEnrichment() {
        return rateCategory != null
                && basis != null
                && quantity != null
                && unitRate != null
                && sourceRateVersionId != null;
    }
}
