package com.linercore.platform.booking.applicationservice.pricing;

public record ChargePricingLineItem(
        String chargeCode,
        String category,
        String basis,
        int quantity,
        String amount,
        String currencyId) {
    public ChargePricingLineItem(String chargeCode, String basis, int quantity, String amount, String currencyId) {
        this(chargeCode, "FREIGHT", basis, quantity, amount, currencyId);
    }

    public ChargePricingLineItem {
        if (chargeCode == null || chargeCode.isBlank()) {
            throw new IllegalArgumentException("charge code is required");
        }
        category = category == null || category.isBlank() ? "FREIGHT" : category;
        if (amount == null || amount.isBlank()) {
            throw new IllegalArgumentException("amount is required");
        }
    }
}
