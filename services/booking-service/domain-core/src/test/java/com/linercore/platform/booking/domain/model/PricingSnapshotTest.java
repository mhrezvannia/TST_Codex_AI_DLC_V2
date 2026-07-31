package com.linercore.platform.booking.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PricingSnapshotTest {
    private static final Instant NOW = Instant.parse("2026-07-29T10:00:00Z");

    @Test
    void retainsOrderedTypedLinesAndExactDecimals() {
        PricingSnapshot snapshot = PricingSnapshot.typed(typed("a".repeat(64), lines()));

        assertEquals(List.of("OFR", "BAF", "THC"),
                snapshot.typed().lines().stream().map(PricingLineSnapshot::chargeCode).toList());
        assertEquals(new BigDecimal("125.50"), snapshot.typed().total());
        assertTrue(snapshot.confirmationEligible(0, "a".repeat(64)));
    }

    @Test
    void typedCollectionsAreImmutableCopies() {
        ArrayList<PricingLineSnapshot> mutable = new ArrayList<>(lines());
        BookingPricingSnapshot snapshot = typed("a".repeat(64), mutable);
        mutable.clear();

        assertEquals(3, snapshot.lines().size());
        assertThrows(UnsupportedOperationException.class, () -> snapshot.lines().clear());
    }

    @Test
    void rejectsReceivedTotalThatDoesNotMatchReceivedLines() {
        assertThrows(IllegalArgumentException.class, () -> new BookingPricingSnapshot(
                2, "price-1", "BKG-1", 0, 1, "a".repeat(64), LocalDate.parse("2026-08-01"),
                "TARIFF", "tariff:NA-EU", null, lines(), List.of(), new BigDecimal("125.51"), "USD",
                NOW, "corr-1", NOW));
    }

    @Test
    void rejectsInvalidMoneyScaleAndCurrency() {
        assertThrows(IllegalArgumentException.class, () -> new PricingLineSnapshot(
                "OFR", "FREIGHT", "BASE", "PER_CONTAINER", 1, new BigDecimal("100.001"),
                new BigDecimal("100.00"), "USD", "rate-1"));
        assertThrows(IllegalArgumentException.class, () -> new PricingLineSnapshot(
                "OFR", "FREIGHT", "BASE", "PER_CONTAINER", 1, new BigDecimal("100.00"),
                new BigDecimal("100.00"), "EUR", "rate-1"));
    }

    @Test
    void legacySnapshotRemainsDistinctAndReadOnly() {
        PricingSnapshot snapshot = new PricingSnapshot(
                "legacy-request", "legacy-quote", "QUOTED", Map.of("total", "100.00 USD"), NOW, "corr-1");

        assertEquals("100.00 USD", snapshot.legacy().quotedAmounts().get("total"));
        assertFalse(snapshot.typed() != null);
        assertThrows(UnsupportedOperationException.class,
                () -> snapshot.legacy().quotedAmounts().put("total", "0 USD"));
    }

    @Test
    void staleTypedSnapshotCannotSatisfyConfirmation() {
        PricingSnapshot snapshot = PricingSnapshot.typed(typed("a".repeat(64), lines()));

        assertFalse(snapshot.confirmationEligible(1, "a".repeat(64)));
        assertFalse(snapshot.confirmationEligible(0, "b".repeat(64)));
    }

    private static BookingPricingSnapshot typed(String fingerprint, List<PricingLineSnapshot> lines) {
        return new BookingPricingSnapshot(
                2, "price-1", "BKG-1", 0, 1, fingerprint, LocalDate.parse("2026-08-01"),
                "TARIFF", "tariff:NA-EU", null, lines, List.of("IMPORT_DND"), new BigDecimal("125.50"),
                "USD", NOW, "corr-1", NOW);
    }

    private static List<PricingLineSnapshot> lines() {
        return List.of(
                new PricingLineSnapshot("OFR", "FREIGHT", "BASE", "PER_CONTAINER", 1,
                        new BigDecimal("100.00"), new BigDecimal("100.00"), "USD", "rate-base"),
                new PricingLineSnapshot("BAF", "SURCHARGE", "SURCHARGE", "PER_CONTAINER", 1,
                        new BigDecimal("20.25"), new BigDecimal("20.25"), "USD", "rate-surcharge"),
                new PricingLineSnapshot("THC", "LOCAL", "LOCAL", "PER_CONTAINER", 1,
                        new BigDecimal("5.25"), new BigDecimal("5.25"), "USD", "rate-local"));
    }
}
