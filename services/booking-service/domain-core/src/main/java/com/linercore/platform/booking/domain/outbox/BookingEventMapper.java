package com.linercore.platform.booking.domain.outbox;

import com.linercore.platform.booking.domain.model.Booking;
import java.time.Instant;
import static java.util.Map.entry;
import java.util.Map;

public class BookingEventMapper {
    public static final String SCHEMA_VERSION = "1.0.0";

    public BookingOutboxEvent confirmedEvent(String eventId, Booking booking, String correlationId, Instant now) {
        String eventType = "booking.confirmed";
        String deduplicationKey = booking.id().value() + ":" + booking.revision() + ":CONFIRMED";
        String pricingRef = booking.pricingSnapshot() == null ? "" : booking.pricingSnapshot().pricingQuoteId();
        String containerId = booking.attributes().getOrDefault("containerId", "");
        return new BookingOutboxEvent(eventId, eventType, SCHEMA_VERSION, booking.id().value(), booking.bookingNumber(), booking.revision(),
                eventType + "-value", "booking-service", deduplicationKey, correlationId, now,
                Map.ofEntries(
                        entry("eventId", eventId),
                        entry("eventType", eventType),
                        entry("schemaVersion", SCHEMA_VERSION),
                        entry("source", "booking-service"),
                        entry("occurredAt", now.toString()),
                        entry("correlationId", correlationId),
                        entry("idempotencyKey", deduplicationKey),
                        entry("bookingId", booking.id().value()),
                        entry("bookingNumber", booking.bookingNumber()),
                        entry("bookingRevision", String.valueOf(booking.revision())),
                        entry("pricingRef", pricingRef),
                        entry("status", booking.status().name()),
                        entry("customerId", booking.customerId()),
                        entry("originLocationId", booking.originLocationId()),
                        entry("destinationLocationId", booking.destinationLocationId()),
                        entry("containerId", containerId),
                        entry("equipmentTypeId", booking.equipmentType())),
                OutboxStatus.PENDING, 0, null, null, null, null, null);
    }
}
