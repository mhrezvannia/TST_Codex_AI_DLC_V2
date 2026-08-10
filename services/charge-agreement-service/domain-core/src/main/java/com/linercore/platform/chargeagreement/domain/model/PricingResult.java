package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record PricingResult(
        String pricingRequestId,
        AgreementId agreementId,
        List<PricingLine> lines,
        MoneyAmount total,
        String pricingBasis,
        String pricingRef,
        List<String> applicableDndRuleTypes,
        boolean manualPricingRequired,
        String reasonCode,
        String correlationId) {
    public PricingResult {
        lines = List.copyOf(lines == null ? List.of() : lines);
        applicableDndRuleTypes = List.copyOf(applicableDndRuleTypes == null ? List.of() : applicableDndRuleTypes);
        if (!manualPricingRequired && lines.isEmpty()) {
            throw new IllegalArgumentException("automatic pricing requires at least one line");
        }
        pricingBasis = pricingBasis == null ? "" : pricingBasis;
        pricingRef = pricingRef == null ? "" : pricingRef;
    }

    public static PricingResult priced(String requestId, AgreementId agreementId, List<PricingLine> lines, String correlationId) {
        BigDecimal totalAmount = lines.stream()
                .map(line -> line.amount().amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ReferenceId currency = lines.get(0).amount().currencyId();
        return new PricingResult(requestId, agreementId, lines, new MoneyAmount(totalAmount, currency),
                "AGREEMENT", agreementId.value(), List.of(), false, "PRICED", correlationId);
    }

    public static PricingResult manual(String requestId, String reasonCode, String correlationId) {
        return new PricingResult(requestId, null, List.of(), null, "", "", List.of(), true, reasonCode, correlationId);
    }
}
