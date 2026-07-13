package com.linercore.platform.booking.domain.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BookingEventMapperTest {
    @Test
    void mapsConfirmedBookingToOutboxEventEvidence() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        Booking booking = Booking.draft(new BookingId("booking-1"), "BKG-0001", "customer-1", "loc-origin",
                "loc-destination", "40HC", Map.of("containerId", "CONT0000001"), "booking-user", "corr-1", now)
                .validated("booking-user", "corr-1", now)
                .pricingPending("price-req-1", "booking-user", "corr-1", now)
                .priced(new com.linercore.platform.booking.domain.model.PricingSnapshot("price-req-1", "quote-1",
                        "QUOTED", Map.of("total", "100.00 USD"), now, "corr-1"), "pricing-service", now)
                .confirmed("booking-user", "corr-1", now);

        BookingOutboxEvent event = new BookingEventMapper().confirmedEvent("event-1", booking, "corr-1", now);

        assertEquals("booking.confirmed", event.eventType());
        assertEquals("1.0.0", event.schemaVersion());
        assertEquals("booking.confirmed-value", event.schemaSubject());
        assertEquals("booking-service", event.producerIdentity());
        assertEquals("booking-1:1:CONFIRMED", event.deduplicationKey());
        assertEquals("corr-1", event.correlationId());
        assertEquals("quote-1", event.payload().get("pricingRef"));
        assertEquals("CONT0000001", event.payload().get("containerId"));
        assertEquals("40HC", event.payload().get("equipmentTypeId"));
    }
}
