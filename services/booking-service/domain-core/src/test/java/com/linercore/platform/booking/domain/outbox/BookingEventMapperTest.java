package com.linercore.platform.booking.domain.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class BookingEventMapperTest {
    @Test
    void mapsConfirmedBookingToOutboxEventEvidence() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        Booking booking = Booking.draft(new BookingId("booking-1"), "BKG-0001", "customer-1",
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")), "USD", "FCL_DRY", false, false,
                Map.of("containerId", "CONT0000001"), "booking-user", "corr-1", now)
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
        assertEquals(event.eventId(), event.payload().get("id"));
        assertEquals(5, UUID.fromString(event.eventId()).version());
        assertEquals("booking-service", event.payload().get("source"));
        assertEquals("booking.confirmed", event.payload().get("type"));
        assertEquals(now.toString(), event.payload().get("time"));
        assertEquals("1", event.payload().get("dataSchemaVersion"));
        assertEquals("booking-1", event.payload().get("data.bookingId"));
        assertEquals("1", event.payload().get("data.bookingRevision"));
        assertEquals("1", event.payload().get("data.routing.count"));
        assertEquals("1", event.payload().get("data.routing.0.legSequence"));
        assertEquals("USNYC", event.payload().get("data.routing.0.loadUnLocode"));
        assertEquals("NLRTM", event.payload().get("data.routing.0.dischargeUnLocode"));
        assertEquals("voyage-1", event.payload().get("data.routing.0.voyageId"));
        assertEquals("1", event.payload().get("data.equipment.count"));
        assertEquals("45G1", event.payload().get("data.equipment.0.equipmentTypeCode"));
        assertEquals("1", event.payload().get("data.equipment.0.quantity"));
        assertEquals("MSCU6639870", event.payload().get("data.equipment.0.equipmentId"));
        assertFalse(event.payload().containsKey("pricingRef"));
        assertFalse(event.payload().containsKey("customerId"));
        assertFalse(event.payload().containsKey("originLocationId"));
    }
}
