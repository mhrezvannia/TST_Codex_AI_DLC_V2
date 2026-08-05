package com.linercore.platform.chargeagreement.domain.model;

import com.linercore.platform.chargeagreement.domain.rate.RateBasis;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record PricingLine(
        String chargeTermId,
        ReferenceId chargeCodeId,
        ChargeCategory category,
        ChargeBasis basis,
        int quantity,
        MoneyAmount rate,
        MoneyAmount amount,
        RateCategory rateCategory,
        RateBasis providerBasis,
        String sourceRateVersionId) {
    public PricingLine(
            String chargeTermId,
            ReferenceId chargeCodeId,
            ChargeBasis basis,
            int quantity,
            MoneyAmount rate,
            MoneyAmount amount) {
        this(chargeTermId, chargeCodeId, ChargeCategory.FREIGHT, basis, quantity, rate, amount,
                RateCategory.BASE, RateBasis.PER_CONTAINER, chargeTermId);
    }

    public PricingLine(
            String chargeTermId,
            ReferenceId chargeCodeId,
            ChargeCategory category,
            ChargeBasis basis,
            int quantity,
            MoneyAmount rate,
            MoneyAmount amount) {
        this(chargeTermId, chargeCodeId, category, basis, quantity, rate, amount,
                legacyRateCategory(category), RateBasis.PER_CONTAINER, chargeTermId);
    }

    public PricingLine {
        chargeTermId = required(chargeTermId, "pricing line id");
        Objects.requireNonNull(chargeCodeId, "charge code is required");
        Objects.requireNonNull(category, "legacy category is required");
        Objects.requireNonNull(basis, "legacy basis is required");
        Objects.requireNonNull(rate, "unit rate is required");
        Objects.requireNonNull(amount, "line amount is required");
        Objects.requireNonNull(rateCategory, "rate category is required");
        Objects.requireNonNull(providerBasis, "provider basis is required");
        sourceRateVersionId = required(sourceRateVersionId, "source rate version id");
        if (quantity <= 0) {
            throw new IllegalArgumentException("pricing quantity must be positive");
        }
        if (providerBasis != RateBasis.PER_CONTAINER) {
            throw new IllegalArgumentException("provider pricing lines must use PER_CONTAINER");
        }
        if (!legacyRateCategory(category).equals(rateCategory)) {
            throw new IllegalArgumentException("legacy and additive rate categories must agree");
        }
        if (!rate.currencyId().equals(amount.currencyId())) {
            throw new IllegalArgumentException("unit rate and amount currency must agree");
        }
        BigDecimal expected = rate.amount()
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(2, RoundingMode.HALF_UP);
        if (amount.amount().compareTo(expected) != 0) {
            throw new IllegalArgumentException("pricing amount must equal rate times quantity");
        }
    }

    public BigDecimal unitRate() {
        return rate.amount();
    }

    public String currency() {
        return amount.currencyId().value();
    }

    private static RateCategory legacyRateCategory(ChargeCategory category) {
        return switch (category) {
            case FREIGHT -> RateCategory.BASE;
            case SURCHARGE -> RateCategory.SURCHARGE;
            case LOCAL -> RateCategory.LOCAL;
        };
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank() || value.length() > 128) {
            throw new IllegalArgumentException(label + " is required and must not exceed 128 characters");
        }
        return value;
    }
}
