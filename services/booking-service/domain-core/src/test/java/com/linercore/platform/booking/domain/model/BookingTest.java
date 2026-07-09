package com.linercore.platform.booking.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BookingTest {
    private final Instant now = Instant.parse("2026-07-01T00:00:00Z");

    @Test
    void confirmsBookingOnlyAfterValidationAndPricingSnapshot() {
        Booking booking = draft()
                .validated("booking-user", "corr-1", now)
                .pricingPending("price-req-1", "booking-user", "corr-1", now)
                .priced(new PricingSnapshot("price-req-1", "quote-1", "QUOTED", Map.of("total", "100.00 USD"), now, "corr-1"),
                        "pricing-service", now)
                .confirmed("booking-user", "corr-1", now);

        assertEquals(BookingStatus.CONFIRMED, booking.status());
        assertEquals("100.00 USD", booking.pricingSnapshot().quotedAmounts().get("total"));
        assertEquals(5, booking.lifecycleEvents().size());
    }

    @Test
    void rejectsConfirmationWithoutPricing() {
        Booking booking = draft().validated("booking-user", "corr-1", now);

        assertThrows(IllegalStateException.class, () -> booking.confirmed("booking-user", "corr-1", now));
    }

    @Test
    void amendsAndReconfirmsWithoutCalculatingPricing() {
        Booking confirmed = draft()
                .validated("booking-user", "corr-1", now)
                .pricingPending("price-req-1", "booking-user", "corr-1", now)
                .priced(new PricingSnapshot("price-req-1", "quote-1", "QUOTED", Map.of("total", "100.00 USD"), now, "corr-1"),
                        "pricing-service", now)
                .confirmed("booking-user", "corr-1", now);

        Booking reconfirmed = confirmed
                .amended(Map.of("specialInstructions", "reefer plug required"), "booking-user", "corr-2", now)
                .reconfirmed("booking-user", "corr-2", now);

        assertEquals(BookingStatus.RECONFIRMED, reconfirmed.status());
        assertEquals(2, reconfirmed.revision());
        assertEquals("quote-1", reconfirmed.pricingSnapshot().pricingQuoteId());
    }

    @Test
    void recordsExceptionsAndDndTriggerCandidatesAsBookingEvidenceOnly() {
        Booking booking = draft()
                .exception("REFERENCE_VALIDATION_FAILED", "origin is inactive", "booking-user", "corr-3", now)
                .dndTriggerCandidate("dnd-candidate-1", "confirmed import booking", "booking-user", "corr-4", now);

        assertEquals(BookingStatus.EXCEPTION, booking.status());
        assertEquals(1, booking.exceptions().size());
        assertEquals(1, booking.dndTriggerCandidates().size());
    }

    private Booking draft() {
        return Booking.draft(new BookingId("booking-1"), "BKG-0001", "customer-1", "loc-origin", "loc-destination",
                "40HC", Map.of(), "booking-user", "corr-1", now);
    }
}
