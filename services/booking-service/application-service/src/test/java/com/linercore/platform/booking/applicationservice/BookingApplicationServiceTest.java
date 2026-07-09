package com.linercore.platform.booking.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class BookingApplicationServiceTest {
    private final InMemoryBookings bookings = new InMemoryBookings();
    private final InMemoryIdempotency idempotency = new InMemoryIdempotency();
    private final List<String> audit = new ArrayList<>();
    private final List<BookingOutboxEvent> outbox = new ArrayList<>();
    private final BookingApplicationService service = new BookingApplicationService(
            bookings,
            idempotency,
            (subjectId, resource, action, correlationId) -> true,
            (referenceSet, referenceId, correlationId) -> !referenceId.startsWith("missing"),
            (booking, idempotencyKey, correlationId) -> "price-req-1",
            audit(),
            outbox::add,
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));

    @Test
    void createDraftIsIdempotent() {
        Booking first = service.createDraft(command("idem-1", "customer-1", "loc-origin", "loc-destination"));
        Booking second = service.createDraft(command("idem-1", "customer-1", "loc-origin", "loc-destination"));

        assertEquals(first.id(), second.id());
        assertEquals(1, bookings.records.size());
    }

    @Test
    void authorizationDenialPreventsPersistence() {
        BookingApplicationService denied = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> false,
                (referenceSet, referenceId, correlationId) -> true,
                (booking, idempotencyKey, correlationId) -> "price-req-1",
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.systemUTC());

        assertThrows(SecurityException.class,
                () -> denied.createDraft(command("idem-denied", "customer-1", "loc-origin", "loc-destination")));
    }

    @Test
    void validationFailureRecordsExceptionState() {
        Booking booking = service.createDraft(command("idem-2", "customer-1", "missing-origin", "loc-destination"));

        Booking validated = service.validate(booking.id(), "booking-user", "corr-2");

        assertEquals(BookingStatus.EXCEPTION, validated.status());
        assertEquals("REFERENCE_VALIDATION_FAILED", validated.exceptions().get(0).code());
    }

    @Test
    void pricingSnapshotAndConfirmationProduceOutboxEvidence() {
        Booking booking = service.createDraft(command("idem-3", "customer-1", "loc-origin", "loc-destination"));
        service.validate(booking.id(), "booking-user", "corr-3");
        service.requestPricing(booking.id(), "booking-user", "price-idem-1", "corr-3");
        service.storePricingSnapshot(booking.id(), new PricingSnapshotCommand("price-req-1", "quote-1", "QUOTED",
                Map.of("total", "100.00 USD"), "pricing-service", "corr-3"));

        Booking confirmed = service.confirm(booking.id(), "booking-user", "corr-3");

        assertEquals(BookingStatus.CONFIRMED, confirmed.status());
        assertEquals(1, outbox.size());
        assertEquals("booking.confirmed-value", outbox.get(0).schemaSubject());
        assertEquals("booking-service", outbox.get(0).producerIdentity());
        assertEquals("corr-3", outbox.get(0).correlationId());
    }

    @Test
    void dndTriggerCandidateIsBookingEvidenceOnly() {
        Booking booking = service.createDraft(command("idem-4", "customer-1", "loc-origin", "loc-destination"));

        Booking next = service.recordDndTriggerCandidate(booking.id(), "import booking confirmed", "booking-user", "corr-4");

        assertEquals(1, next.dndTriggerCandidates().size());
        assertEquals(0, outbox.size());
    }

    private CreateBookingCommand command(String idempotencyKey, String customerId, String origin, String destination) {
        return new CreateBookingCommand(idempotencyKey, customerId, origin, destination, "40HC", Map.of(),
                "booking-user", "corr-1");
    }

    private AuditRepository audit() {
        return (eventType, bookingId, actorSubjectId, result, reason, correlationId) ->
                audit.add(eventType + ":" + result + ":" + correlationId);
    }

    private static class InMemoryBookings implements BookingRepository {
        private final Map<BookingId, Booking> records = new LinkedHashMap<>();

        public Booking save(Booking booking) {
            records.put(booking.id(), booking);
            return booking;
        }

        public Optional<Booking> findById(BookingId id) {
            return Optional.ofNullable(records.get(id));
        }
    }

    private static class InMemoryIdempotency implements IdempotencyRepository {
        private final Map<String, BookingId> keys = new LinkedHashMap<>();

        public Optional<BookingId> findBookingId(String idempotencyKey) {
            return Optional.ofNullable(keys.get(idempotencyKey));
        }

        public void remember(String idempotencyKey, BookingId bookingId) {
            keys.put(idempotencyKey, bookingId);
        }
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}
