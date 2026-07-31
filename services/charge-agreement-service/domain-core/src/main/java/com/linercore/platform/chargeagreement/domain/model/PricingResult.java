package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;

public record PricingResult(
        String pricingRequestId,
        AgreementId agreementId,
        List<PricingLine> lines,
        MoneyAmount total,
        String pricingBasis,
        String pricingRef,
        List<String> applicableDndRuleTypes,
        String correlationId,
        String bookingRef,
        LocalDate requestedDepartureDate,
        Instant pricedAt,
        String agreementVersionId) {
    public PricingResult {
        lines = List.copyOf(lines == null ? List.of() : lines);
        applicableDndRuleTypes = List.copyOf(applicableDndRuleTypes == null ? List.of() : applicableDndRuleTypes);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("automatic pricing requires at least one line");
        }
        pricingBasis = pricingBasis == null ? "" : pricingBasis;
        pricingRef = pricingRef == null ? "" : pricingRef;
        if (pricedAt != null) {
            validateCompleteW2Success(lines, total, pricingBasis, pricingRef, correlationId, bookingRef,
                    requestedDepartureDate, agreementVersionId);
        }
    }

    public static PricingResult priced(String requestId, AgreementId agreementId, List<PricingLine> lines, String correlationId) {
        BigDecimal totalAmount = lines.stream()
                .map(line -> line.amount().amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ReferenceId currency = lines.get(0).amount().currencyId();
        return new PricingResult(requestId, agreementId, lines, new MoneyAmount(totalAmount, currency),
                "AGREEMENT", agreementId.value(), List.of(), correlationId,
                requestId, null, null, agreementId.value());
    }

    public static PricingResult w2Priced(
            String pricingRequestId,
            String bookingRef,
            String pricingBasis,
            String pricingRef,
            String agreementVersionId,
            LocalDate requestedDepartureDate,
            List<PricingLine> lines,
            String correlationId,
            Instant pricedAt) {
        Objects.requireNonNull(pricedAt, "priced time is required");
        BigDecimal totalAmount = lines.stream()
                .map(line -> line.amount().amount())
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add)
                .setScale(2);
        ReferenceId currency = lines.get(0).amount().currencyId();
        AgreementId legacyAgreementId = agreementVersionId == null ? null : new AgreementId(agreementVersionId);
        return new PricingResult(pricingRequestId, legacyAgreementId, lines, new MoneyAmount(totalAmount, currency),
                pricingBasis, pricingRef, List.of(), correlationId, bookingRef,
                requestedDepartureDate, pricedAt, agreementVersionId);
    }

    public BigDecimal totalAmount() {
        return total == null ? null : total.amount();
    }

    public String currency() {
        return total == null ? null : total.currencyId().value();
    }

    private static void validateCompleteW2Success(
            List<PricingLine> lines,
            MoneyAmount total,
            String pricingBasis,
            String pricingRef,
            String correlationId,
            String bookingRef,
            LocalDate requestedDepartureDate,
            String agreementVersionId) {
        if (lines.size() != 3) {
            throw new IllegalArgumentException("W2 pricing requires exactly three lines");
        }
        if (!lines.stream().map(PricingLine::rateCategory).collect(
                java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(RateCategory.class)))
                .equals(EnumSet.allOf(RateCategory.class))) {
            throw new IllegalArgumentException("W2 pricing requires BASE, SURCHARGE, and LOCAL lines");
        }
        if (!lines.stream().map(PricingLine::rateCategory).toList()
                .equals(List.of(RateCategory.BASE, RateCategory.SURCHARGE, RateCategory.LOCAL))) {
            throw new IllegalArgumentException("W2 pricing lines must be ordered BASE, SURCHARGE, LOCAL");
        }
        if (lines.stream().anyMatch(line -> line.basis() != ChargeBasis.CONTAINER
                || line.providerBasis()
                        != com.linercore.platform.chargeagreement.domain.rate.RateBasis.PER_CONTAINER)) {
            throw new IllegalArgumentException("W2 pricing lines must use PER_CONTAINER");
        }
        Objects.requireNonNull(total, "W2 pricing total is required");
        Objects.requireNonNull(requestedDepartureDate, "requested departure date is required");
        required(pricingRef, "pricing reference");
        required(correlationId, "correlation id");
        required(bookingRef, "booking reference");
        if ("AGREEMENT".equals(pricingBasis)) {
            required(agreementVersionId, "agreement version id");
        } else if (!"TARIFF".equals(pricingBasis) || agreementVersionId != null) {
            throw new IllegalArgumentException("pricing basis and agreement version are inconsistent");
        }
        BigDecimal expected = lines.stream()
                .map(line -> line.amount().amount())
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add)
                .setScale(2);
        if (total.amount().compareTo(expected) != 0) {
            throw new IllegalArgumentException("pricing total must equal the sum of rounded lines");
        }
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank() || value.length() > 128) {
            throw new IllegalArgumentException(label + " is required and must not exceed 128 characters");
        }
        return value;
    }
}
