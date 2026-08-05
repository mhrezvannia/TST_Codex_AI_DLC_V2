package com.linercore.platform.chargeagreement.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class RateVersionTest {
    private static final ValidityWindow WINDOW = new ValidityWindow(
            LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"));

    @Test
    void localChargeRequiresLocationAndOnlyUsdIsAccepted() {
        assertThrows(IllegalArgumentException.class, () -> draft(ChargeCategory.LOCAL, null, "USD"));
        assertThrows(IllegalArgumentException.class, () -> draft(ChargeCategory.FREIGHT, null, "EUR"));
        assertThrows(IllegalArgumentException.class, () -> draft(ChargeCategory.SURCHARGE, ref("USNYC"), "USD"));
    }

    @Test
    void approvedRateMatchesLaneEquipmentDateAndLocalPort() {
        RateVersion approved = draft(ChargeCategory.LOCAL, ref("USNYC"), "USD").approve();
        PricingRequest matching = request("lane-1", "22G1", "USNYC");

        assertTrue(approved.matches(matching));
        assertFalse(approved.matches(request("lane-2", "22G1", "USNYC")));
        assertEquals(new BigDecimal("25.00"), approved.price(matching).amount().amount());
    }

    @Test
    void newVersionKeepsDefinitionAndPredecessorButChangesAmount() {
        RateVersion approved = draft(ChargeCategory.FREIGHT, null, "USD").approve();
        RateVersion next = approved.nextDraft("rate-v2", money("75.00", "USD"), WINDOW);

        assertEquals(2, next.version());
        assertEquals(approved.definitionId(), next.definitionId());
        assertEquals(approved.id(), next.previousVersionId());
        assertEquals(new BigDecimal("75.00"), next.amount().amount());
        assertThrows(IllegalStateException.class, () -> next.nextDraft("rate-v3", money("80.00", "USD"), WINDOW));
    }

    private RateVersion draft(ChargeCategory category, ReferenceId location, String currency) {
        return RateVersion.draft("rate-v1", "rate-1", category, ref("BAF"), ref("lane-1"), ref("22G1"),
                location, money("25.00", currency), WINDOW);
    }

    private PricingRequest request(String lane, String equipment, String pol) {
        return new PricingRequest("booking-1", lane, pol, "NLRTM", equipment, "cust-1", "general", false,
                false, new PricingRequest.PricingDates(LocalDate.parse("2026-06-01"), LocalDate.parse("2026-06-01")),
                new PricingRequest.PricingQuantities(1, 2, 0), "corr-1");
    }

    private MoneyAmount money(String amount, String currency) {
        return new MoneyAmount(new BigDecimal(amount), ref(currency));
    }

    private ReferenceId ref(String value) {
        return new ReferenceId(value);
    }
}
