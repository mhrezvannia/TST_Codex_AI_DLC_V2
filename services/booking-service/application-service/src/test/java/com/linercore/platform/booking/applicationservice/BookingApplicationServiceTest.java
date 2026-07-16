package com.linercore.platform.booking.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.applicationservice.dnd.ChargeDndPricingClientException;
import com.linercore.platform.booking.applicationservice.dnd.ChargeDndPricingFailureType;
import com.linercore.platform.booking.applicationservice.dnd.ChargeDndPricingPortAdapter;
import com.linercore.platform.booking.applicationservice.dnd.ChargeDndPricingResponse;
import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import com.linercore.platform.booking.applicationservice.port.DndPricingOutcome;
import com.linercore.platform.booking.applicationservice.port.DndPricingResult;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
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
            (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
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
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
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
    void requestPricingStoresImmediateChargeSnapshot() {
        BookingApplicationService pricedService = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                (referenceSet, referenceId, correlationId) -> true,
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.priced("price-req-2", "quote-2",
                        Map.of("pricingBasis", "AGREEMENT", "requestHash", "hash-1"), correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
        Booking booking = pricedService.createDraft(command("idem-priced", "customer-1", "loc-origin", "loc-destination"));
        pricedService.validate(booking.id(), "booking-user", "corr-priced");

        Booking priced = pricedService.requestPricing(booking.id(), "booking-user", "price-idem-2", "corr-priced");

        assertEquals(BookingStatus.PRICED, priced.status());
        assertEquals("quote-2", priced.pricingSnapshot().pricingQuoteId());
        assertEquals("AGREEMENT", priced.pricingSnapshot().quotedAmounts().get("pricingBasis"));
    }

    @Test
    void manualPricingResponseIsVisibleExceptionState() {
        BookingApplicationService manualService = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                (referenceSet, referenceId, correlationId) -> true,
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.manual("price-req-manual",
                        "NO_ACTIVE_AGREEMENT", "Charge requires manual pricing", correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
        Booking booking = manualService.createDraft(command("idem-manual", "customer-1", "loc-origin", "loc-destination"));
        manualService.validate(booking.id(), "booking-user", "corr-manual");

        Booking manual = manualService.requestPricing(booking.id(), "booking-user", "price-idem-manual", "corr-manual");

        assertEquals(BookingStatus.EXCEPTION, manual.status());
        assertEquals("price-req-manual", manual.attributes().get("pricingRequestId"));
        assertEquals("MANUAL_PRICING_REQUIRED", manual.exceptions().get(0).code());
    }

    @Test
    void dndTriggerCandidateIsBookingEvidenceOnly() {
        Booking booking = service.createDraft(command("idem-4", "customer-1", "loc-origin", "loc-destination"));

        Booking next = service.recordDndTriggerCandidate(booking.id(), "import booking confirmed", "booking-user", "corr-4");

        assertEquals(1, next.dndTriggerCandidates().size());
        assertEquals(0, outbox.size());
    }

    @Test
    void consumesMovementStatusAsLifecycleEvidence() {
        Booking booking = confirmedBooking("idem-move-1");

        Booking moved = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1",
                "IN_TRANSIT", 1));

        assertEquals("IN_TRANSIT", moved.attributes().get("movementStatus"));
        assertEquals("1", moved.attributes().get("movementSequenceNumber"));
        assertEquals("CONT0000001", moved.attributes().get("movementContainerId"));
        assertEquals(0, moved.dndTriggerCandidates().size());
    }

    @Test
    void duplicateMovementStatusDoesNotAddLifecycleEvidence() {
        Booking booking = confirmedBooking("idem-move-2");
        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1", "IN_TRANSIT", 1));

        Booking replay = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1",
                "IN_TRANSIT", 1));

        assertEquals("1", replay.attributes().get("movementSequenceNumber"));
        assertEquals("BOOKING_MOVEMENT_STATUS_DUPLICATE:SUCCESS:corr-move", audit.get(audit.size() - 1));
    }

    @Test
    void staleMovementStatusIsIgnoredBySequenceNumber() {
        Booking booking = confirmedBooking("idem-move-3");
        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-2", "move-2", "ARRIVED", 2));

        Booking stale = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1",
                "IN_TRANSIT", 1));

        assertEquals("ARRIVED", stale.attributes().get("movementStatus"));
        assertEquals("2", stale.attributes().get("movementSequenceNumber"));
        assertEquals("BOOKING_MOVEMENT_STATUS_STALE:SUCCESS:corr-move", audit.get(audit.size() - 1));
    }

    @Test
    void arrivedMovementStatusRecordsDndTriggerInputEvidence() {
        Booking booking = confirmedBooking("idem-move-4");

        Booking arrived = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-2", "move-2",
                "ARRIVED", 2));

        assertEquals(1, arrived.dndTriggerCandidates().size());
        assertEquals("movement status ARRIVED at SGSIN", arrived.dndTriggerCandidates().get(0).reason());
    }

    @Test
    void deniedMovementStatusConsumerFailsClosed() {
        BookingApplicationService denied = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> !"consume-movement-status".equals(action),
                (referenceSet, referenceId, correlationId) -> true,
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
        Booking booking = confirmedBooking("idem-move-denied");

        assertThrows(SecurityException.class,
                () -> denied.consumeMovementStatus(movementStatus(booking.id(), "event-move-denied", "move-denied",
                        "IN_TRANSIT", 1)));
    }

    @Test
    void requestDndPricingStoresChargeResultSnapshot() {
        BookingApplicationService dndService = dndService(DndPricingResult.priced("dnd-ref-1", 4,
                Map.of("line.1", "DETENTION:60.00 USD"), "corr-dnd"));
        Booking booking = confirmedBookingWithService(dndService, "idem-dnd-1");
        dndService.consumeMovementStatus(movementStatus(booking.id(), "event-arrived", "move-arrived", "ARRIVED", 2));

        Booking priced = dndService.requestDndPricing(booking.id(), "booking-user", "dnd-idem-1", "corr-dnd");

        assertEquals("dnd-ref-1", priced.attributes().get("dndPricingRef"));
        assertEquals("4", priced.attributes().get("dndChargeableDays"));
        assertEquals("DETENTION:60.00 USD", priced.attributes().get("dnd.line.1"));
    }

    @Test
    void manualDndPricingResultRoutesToBookingException() {
        BookingApplicationService dndService = dndService(DndPricingResult.failure(DndPricingOutcome.MANUAL_REQUIRED,
                "MISSING_FREE_TIME_RULE", "Charge requires manual D&D pricing", "corr-dnd"));
        Booking booking = confirmedBookingWithService(dndService, "idem-dnd-2");

        Booking exception = dndService.requestDndPricing(booking.id(), "booking-user", "dnd-idem-2", "corr-dnd");

        assertEquals("DND_MANUAL_PRICING_REQUIRED", exception.exceptions().get(0).code());
        assertNull(exception.attributes().get("dndPricingRef"));
    }

    @Test
    void chargeDndPricingAdapterMapsSuccessAndDeniedFailure() {
        ChargeDndPricingPortAdapter success = new ChargeDndPricingPortAdapter(request ->
                new ChargeDndPricingResponse("dnd-ref-2", request.correlationId(), 2, List.of("DETENTION:30.00 USD")));
        DndPricingResult priced = success.requestDndPricing(confirmedBooking("idem-dnd-adapter"), "dnd-idem-3", "corr-dnd");

        assertEquals(DndPricingOutcome.PRICED, priced.outcome());
        assertEquals("dnd-ref-2", priced.dndPricingRef());
        assertEquals("DETENTION:30.00 USD", priced.lineItems().get("line.1"));

        ChargeDndPricingPortAdapter denied = new ChargeDndPricingPortAdapter(request -> {
            throw new ChargeDndPricingClientException(ChargeDndPricingFailureType.DENIED,
                    "SERVICE_IDENTITY_DENIED", "Charge denied service identity");
        });
        DndPricingResult failure = denied.requestDndPricing(confirmedBooking("idem-dnd-denied"), "dnd-idem-4", "corr-dnd");

        assertEquals(DndPricingOutcome.DENIED, failure.outcome());
        assertEquals("SERVICE_IDENTITY_DENIED", failure.reasonCode());
    }

    private CreateBookingCommand command(String idempotencyKey, String customerId, String origin, String destination) {
        return new CreateBookingCommand(idempotencyKey, customerId, origin, destination, "40HC", Map.of(),
                "booking-user", "corr-1");
    }

    private Booking confirmedBooking(String idempotencyKey) {
        return confirmedBookingWithService(service, idempotencyKey);
    }

    private Booking confirmedBookingWithService(BookingApplicationService targetService, String idempotencyKey) {
        Booking booking = targetService.createDraft(command(idempotencyKey, "customer-1", "loc-origin", "loc-destination"));
        targetService.validate(booking.id(), "booking-user", "corr-confirmed");
        targetService.requestPricing(booking.id(), "booking-user", idempotencyKey + "-pricing", "corr-confirmed");
        targetService.storePricingSnapshot(booking.id(), new PricingSnapshotCommand("price-req-1", "quote-1", "QUOTED",
                Map.of("total", "100.00 USD"), "pricing-service", "corr-confirmed"));
        return targetService.confirm(booking.id(), "booking-user", "corr-confirmed");
    }

    private BookingApplicationService dndService(DndPricingResult result) {
        return new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                (referenceSet, referenceId, correlationId) -> !referenceId.startsWith("missing"),
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                (booking, idempotencyKey, correlationId) -> result,
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
    }

    private MovementStatusReceivedEvent movementStatus(BookingId bookingId, String eventId, String idempotencyKey, String status, long sequenceNumber) {
        return new MovementStatusReceivedEvent(eventId, "containermovement.status", "1.0.0",
                "container-movement-service", Instant.parse("2026-07-01T00:05:00Z"), "corr-move",
                idempotencyKey, "CONT0000001", bookingId.value(), status, sequenceNumber,
                "Validated movement", "SGSIN");
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
