package com.linercore.platform.booking.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BookingPricingLifecycleTest {
    private static final Instant NOW = Instant.parse("2026-07-29T10:00:00Z");
    private static final String FINGERPRINT = "a".repeat(64);

    @Test
    void currentTypedPriceCanConfirm() {
        Booking priced = validated().typedPriced(snapshot(1, 0, FINGERPRINT), "pricing-service", NOW);

        assertEquals(BookingStatus.CONFIRMED, priced.confirmed("booking-user", "corr-1", NOW).status());
    }

    @Test
    void pricingChangeAdvancesSequenceAndBlocksStalePrice() {
        Booking confirmed = validated()
                .typedPriced(snapshot(1, 0, FINGERPRINT), "pricing-service", NOW)
                .confirmed("booking-user", "corr-1", NOW);

        Booking amended = confirmed.pricingInputsAmended(
                Map.of("customerNote", "keep"),
                "b".repeat(64),
                "2026-08-02",
                "booking-user",
                "corr-2",
                NOW);

        assertEquals(1, amended.pricingAmendmentSeq());
        assertEquals("REPRICE_REQUIRED", amended.attributes().get("pricingStatus"));
        assertThrows(IllegalStateException.class, () -> amended.reconfirmed("booking-user", "corr-2", NOW));
    }

    @Test
    void nonPricingChangePreservesCurrentPriceAndSequence() {
        Booking confirmed = validated()
                .typedPriced(snapshot(1, 0, FINGERPRINT), "pricing-service", NOW)
                .confirmed("booking-user", "corr-1", NOW);

        Booking amended = confirmed.pricingInputsAmended(
                Map.of("customerNote", "changed"),
                FINGERPRINT,
                "2026-08-01",
                "booking-user",
                "corr-2",
                NOW);

        assertEquals(0, amended.pricingAmendmentSeq());
        assertTrue(amended.confirmationPricingEligible());
        assertEquals(BookingStatus.RECONFIRMED, amended.reconfirmed("booking-user", "corr-2", NOW).status());
    }

    @Test
    void completionRejectsAStaleBookingRevision() {
        assertThrows(IllegalStateException.class,
                () -> validated().typedPriced(snapshot(2, 0, FINGERPRINT), "pricing-service", NOW));
    }

    @Test
    void manualPricingBlocksConfirmationAndContainsNoMoney() {
        Booking manual = validated().manualPricing(
                "price-1", "NO_RATE", "No rate", "pricing-service", "corr-1", NOW);

        assertEquals(BookingStatus.MANUAL_PRICING, manual.status());
        assertEquals(null, manual.pricingSnapshot());
        assertThrows(IllegalStateException.class, () -> manual.confirmed("booking-user", "corr-1", NOW));
    }

    private static Booking validated() {
        return Booking.draft(
                        new BookingId("booking-1"),
                        "BKG-1",
                        "party-1",
                        List.of(new RoutingLeg(1, "NLRTM", "SGSIN", "voyage-1")),
                        List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")),
                        "USD",
                        "FCL_DRY",
                        false,
                        false,
                        Map.of(
                                "requestedDepartureDate", "2026-08-01",
                                "pricingAmendmentSeq", "0",
                                "pricingInputFingerprint", FINGERPRINT),
                        "booking-user",
                        "corr-1",
                        NOW)
                .validated("booking-user", "corr-1", NOW);
    }

    private static BookingPricingSnapshot snapshot(int revision, int sequence, String fingerprint) {
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "20.00"),
                line("THC", "LOCAL", "LOCAL", "5.00"));
        return new BookingPricingSnapshot(
                2, "price-1", "BKG-1", sequence, revision, fingerprint, LocalDate.parse("2026-08-01"),
                "TARIFF", "tariff:NA-EU", null, lines, List.of(), new BigDecimal("125.00"), "USD",
                NOW, "corr-1", NOW);
    }

    private static PricingLineSnapshot line(String code, String category, String rateCategory, String amount) {
        return new PricingLineSnapshot(code, category, rateCategory, "PER_CONTAINER", 1,
                new BigDecimal(amount), new BigDecimal(amount), "USD", "rate-" + code);
    }
}
