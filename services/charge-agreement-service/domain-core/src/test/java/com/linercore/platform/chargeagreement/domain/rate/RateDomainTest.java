package com.linercore.platform.chargeagreement.domain.rate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class RateDomainTest {
    private static final Instant NOW = Instant.parse("2026-07-26T00:00:00Z");

    @Test
    void createsBaseDraftWithCanonicalMoney() {
        Rate rate = firstRate(RateCategory.BASE, "OFR", destination());
        assertEquals(new BigDecimal("125.00"), rate.latestVersion().money().amount());
        assertEquals(RatePresentationState.DRAFT, rate.latestVersion().presentationState(LocalDate.now()));
    }

    @Test
    void rejectsCategoryCodeMismatch() {
        assertThrows(IllegalArgumentException.class,
                () -> firstRate(RateCategory.BASE, "BAF", destination()));
    }

    @Test
    void rejectsLocalDestination() {
        assertThrows(IllegalArgumentException.class,
                () -> firstRate(RateCategory.LOCAL, "THC", destination()));
    }

    @Test
    void acceptsLocalWithoutDestination() {
        Rate rate = firstRate(RateCategory.LOCAL, "THC", null);
        assertNull(rate.latestVersion().applicability().destinationLocationId());
    }

    @Test
    void rejectsNegativeAndOverPrecisionMoney() {
        assertThrows(IllegalArgumentException.class, () -> money("-0.01"));
        assertThrows(IllegalArgumentException.class, () -> money("1.001"));
    }

    @Test
    void derivesApprovedDateBoundariesInclusively() {
        RateVersion approved = firstRate(RateCategory.BASE, "OFR", destination())
                .latestVersion().approve(0, "analyst", NOW, "corr-approve");
        assertEquals(RatePresentationState.SCHEDULED, approved.presentationState(LocalDate.of(2026, 7, 31)));
        assertEquals(RatePresentationState.EFFECTIVE, approved.presentationState(LocalDate.of(2026, 8, 1)));
        assertEquals(RatePresentationState.EFFECTIVE, approved.presentationState(LocalDate.of(2026, 8, 31)));
        assertEquals(RatePresentationState.EXPIRED, approved.presentationState(LocalDate.of(2026, 9, 1)));
    }

    @Test
    void preventsApprovedMutation() {
        RateVersion approved = firstRate(RateCategory.BASE, "OFR", destination())
                .latestVersion().approve(0, "analyst", NOW, "corr-approve");
        assertThrows(IllegalStateException.class, () -> approved.reviseDraft(
                money("130.00"), approved.effectiveFrom(), approved.effectiveTo(),
                approved.applicability(), approved.rowVersion(), "analyst", NOW, "corr-edit"));
    }

    @Test
    void approvalKeyIsLengthPrefixedAndUnambiguous() {
        RateApplicability applicability = applicability(destination());
        assertEquals("rate:v1|4:BASE|7:cc-base|10:loc-origin|8:loc-dest|5:eq-40",
                applicability.approvalKey(RateCategory.BASE, "cc-base"));
    }

    private static Rate firstRate(RateCategory category, String code, ReferenceId destination) {
        return Rate.firstDraft(new RateId("rate-1"), new RateVersionId("rate-version-1"), category,
                new ReferenceId("cc-base"), code, money("125"), LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31), applicability(destination), "analyst", NOW, "corr-create");
    }

    private static RateApplicability applicability(ReferenceId destination) {
        return new RateApplicability(new ReferenceId("loc-origin"), destination, new ReferenceId("eq-40"));
    }

    private static ReferenceId destination() {
        return new ReferenceId("loc-dest");
    }

    private static RateMoney money(String amount) {
        return new RateMoney(new BigDecimal(amount), new ReferenceId("currency-usd"), "USD");
    }
}
