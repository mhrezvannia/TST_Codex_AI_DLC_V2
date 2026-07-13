package com.linercore.platform.booking.applicationservice.pricing;

public record ChargePricingLineItem(
        String chargeCode,
        String basis,
        int quantity,
        String amount,
        String currencyId) {
    public ChargePricingLineItem {
        if (chargeCode == null || chargeCode.isBlank()) {
            throw new IllegalArgumentException("charge code is required");
        }
        if (amount == null || amount.isBlank()) {
            throw new IllegalArgumentException("amount is required");
        }
    }
}
