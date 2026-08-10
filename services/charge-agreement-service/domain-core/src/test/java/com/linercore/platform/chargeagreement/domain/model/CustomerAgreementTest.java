package com.linercore.platform.chargeagreement.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class CustomerAgreementTest {
    private static final Instant NOW = Instant.parse("2026-07-08T00:00:00Z");

    @Test
    void newAgreementStartsInDraftAndNormalizesNumber() {
        CustomerAgreement agreement = draft();

        assertEquals(AgreementStatus.DRAFT, agreement.status());
        assertEquals("AGR-001", agreement.agreementNumber().value());
        assertEquals(1, agreement.version());
    }

    @Test
    void draftAgreementCanUpdateHeaderAndTerms() {
        CustomerAgreement updated = draft()
                .updateHeader(new AgreementNumber("agr-002"), ref("cust-2"), ref("lane-1"), ref("cmdty-1"),
                        new ValidityWindow(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")),
                        "user-1", NOW, "change")
                .replaceTerms(List.of(term("t-1")), "user-1", NOW, "term");

        assertEquals("AGR-002", updated.agreementNumber().value());
        assertEquals(1, updated.terms().size());
        assertEquals(3, updated.version());
    }

    @Test
    void approvalRequiresAtLeastOneChargeTerm() {
        assertThrows(IllegalStateException.class, () -> draft().approve("user-1", NOW, "approve"));
    }

    @Test
    void approvedAgreementCanSuspendOrExpireAndInactiveStatusesDoNotMatchActiveLookup() {
        CustomerAgreement approved = draft()
                .replaceTerms(List.of(term("t-1")), "user-1", NOW, "term")
                .approve("approver-1", NOW, "approve");

        assertTrue(approved.isActiveOn(LocalDate.parse("2026-06-01")));
        assertFalse(approved.suspend("user-1", NOW, "hold").isActiveOn(LocalDate.parse("2026-06-01")));
        assertFalse(approved.expire("user-1", NOW, "expire").isActiveOn(LocalDate.parse("2026-06-01")));
    }

    @Test
    void suspendedAndExpiredAgreementsCannotBeUpdated() {
        CustomerAgreement suspended = draft()
                .replaceTerms(List.of(term("t-1")), "user-1", NOW, "term")
                .approve("approver-1", NOW, "approve")
                .suspend("user-1", NOW, "hold");

        assertThrows(IllegalStateException.class,
                () -> suspended.replaceTerms(List.of(term("t-2")), "user-1", NOW, "term"));
    }

    @Test
    void rejectsNonPositiveChargeAmountAndOutOfWindowTerm() {
        assertThrows(IllegalArgumentException.class,
                () -> new MoneyAmount(BigDecimal.ZERO, ref("usd")));

        ChargeTerm outsideAgreement = new ChargeTerm("t-1", ref("ocean"), ChargeBasis.TEU,
                new MoneyAmount(new BigDecimal("10.00"), ref("usd")),
                new ValidityWindow(LocalDate.parse("2025-12-01"), LocalDate.parse("2026-01-31")),
                "");

        assertThrows(IllegalArgumentException.class,
                () -> draft().replaceTerms(List.of(outsideAgreement), "user-1", NOW, "term"));
    }

    @Test
    void pricingResultTotalsItemisedChargeLines() {
        PricingLine line = new PricingLine("term-1", ref("ocean"), ChargeBasis.TEU, 2,
                new MoneyAmount(new BigDecimal("25.00"), ref("usd")),
                new MoneyAmount(new BigDecimal("50.00"), ref("usd")));

        PricingResult result = PricingResult.priced("price-req-1", new AgreementId("agr-1"), List.of(line), "corr-1");

        assertEquals(new BigDecimal("50.00"), result.total().amount());
    }

    @Test
    void manualPricingIsAnExplicitOutcomeRatherThanAPartialResult() {
        LegacyPricingOutcome.Manual manual =
                new LegacyPricingOutcome.Manual("price-req-2", "NO_ACTIVE_AGREEMENT", "corr-2");

        assertEquals("price-req-2", manual.pricingRequestId());
        assertEquals("NO_ACTIVE_AGREEMENT", manual.reasonCode());
    }

    @Test
    void dndRuleCalculatesOnlyChargeableDays() {
        DndRule rule = new DndRule("dnd-1", 3, new MoneyAmount(new BigDecimal("15.00"), ref("usd")));

        assertEquals(new BigDecimal("30.00"), rule.chargeableAmount(5).amount());
        assertEquals(null, rule.chargeableAmount(3));
    }

    private CustomerAgreement draft() {
        return CustomerAgreement.create(new AgreementId("agr-1"), new AgreementNumber(" agr-001 "),
                ref("cust-1"), ref("lane-1"), ref("cmdty-1"),
                new ValidityWindow(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")),
                "user-1", NOW, "create");
    }

    private ChargeTerm term(String id) {
        return new ChargeTerm(id, ref("ocean"), ChargeBasis.TEU,
                new MoneyAmount(new BigDecimal("25.00"), ref("usd")),
                new ValidityWindow(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")),
                "base rate");
    }

    private ReferenceId ref(String value) {
        return new ReferenceId(value);
    }
}
