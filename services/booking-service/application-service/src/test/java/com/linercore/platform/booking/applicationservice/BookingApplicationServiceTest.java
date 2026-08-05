package com.linercore.platform.booking.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
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
import com.linercore.platform.booking.applicationservice.port.IdempotencyReceipt;
import com.linercore.platform.booking.applicationservice.port.ConsumedEventDisposition;
import com.linercore.platform.booking.applicationservice.port.MovementLocation;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjection;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjectionRepository;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.applicationservice.port.ProjectionUpsertResult;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationResult;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.pricing.PricingInput;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import com.linercore.platform.booking.domain.model.ReferenceFieldResult;
import com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
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
    private final InMemoryMovementStatusProjections movementStatusProjections = new InMemoryMovementStatusProjections();
    private final BookingApplicationService service = new BookingApplicationService(
            bookings,
            idempotency,
            (subjectId, resource, action, correlationId) -> true,
            references(true),
            (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
            audit(),
            outbox::add,
            movementStatusProjections,
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
                references(false),
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.systemUTC());

        assertThrows(SecurityException.class,
                () -> denied.createDraft(command("idem-denied", "customer-1", "loc-origin", "loc-destination")));
    }

    @Test
    void validationFailureRecordsBlockedState() {
        Booking booking = service.createDraft(command("idem-2", "missing-customer", "loc-origin", "loc-destination"));

        Booking validated = service.validate(booking.id(), "booking-user", "corr-2");

        assertEquals(BookingStatus.VALIDATION_BLOCKED, validated.status());
        assertEquals("REFERENCE_NOT_FOUND", validated.referenceValidationSnapshot().fieldResults().get(0).reasonCode());
    }

    @Test
    void pricingSnapshotAndConfirmationProduceOutboxEvidence() {
        Booking booking = service.createDraft(command("idem-3", "customer-1", "loc-origin", "loc-destination"));
        service.validate(booking.id(), "booking-user", "corr-3");
        service.requestPricing(booking.id(), "booking-user", "price-idem-1", "corr-3");
        storeConfirmablePricing(booking.id(), "corr-3");

        Booking confirmed = service.confirm(booking.id(), "booking-user", "confirm-idem-1", "corr-3");

        assertEquals(BookingStatus.CONFIRMED, confirmed.status());
        assertEquals(1, outbox.size());
        assertEquals("booking.confirmed-value", outbox.get(0).schemaSubject());
        assertEquals("booking-service", outbox.get(0).producerIdentity());
        assertEquals("corr-3", outbox.get(0).correlationId());
    }

    @Test
    void confirmIsIdempotentAndDoesNotDuplicateOutbox() {
        Booking booking = service.createDraft(command("idem-confirm-replay", "customer-1", "loc-origin",
                "loc-destination"));
        service.validate(booking.id(), "booking-user", "corr-confirm");
        service.requestPricing(booking.id(), "booking-user", "price-idem-confirm", "corr-confirm");
        storeConfirmablePricing(booking.id(), "corr-confirm");

        Booking first = service.confirm(booking.id(), "booking-user", "confirm-idem-replay", "corr-confirm");
        Booking replay = service.confirm(booking.id(), "booking-user", "confirm-idem-replay", "corr-confirm");

        assertEquals(first.id(), replay.id());
        assertEquals(BookingStatus.CONFIRMED, replay.status());
        assertEquals(1, outbox.size());
    }

    @Test
    void confirmIdempotencyKeyCannotBeReusedForAnotherBooking() {
        Booking first = service.createDraft(command("idem-confirm-conflict-1", "customer-1", "loc-origin",
                "loc-destination"));
        service.validate(first.id(), "booking-user", "corr-confirm");
        service.requestPricing(first.id(), "booking-user", "price-idem-confirm-1", "corr-confirm");
        storeConfirmablePricing(first.id(), "corr-confirm");
        service.confirm(first.id(), "booking-user", "confirm-idem-conflict", "corr-confirm");
        Booking second = service.createDraft(command("idem-confirm-conflict-2", "customer-1", "loc-origin",
                "loc-destination"));
        service.validate(second.id(), "booking-user", "corr-confirm");
        service.requestPricing(second.id(), "booking-user", "price-idem-confirm-2", "corr-confirm");
        storeConfirmablePricing(second.id(), "corr-confirm");

        assertThrows(IdempotencyConflictException.class,
                () -> service.confirm(second.id(), "booking-user", "confirm-idem-conflict", "corr-confirm"));
    }

    @Test
    void pricingAmendmentAdvancesSequenceAndRequiresReprice() {
        Booking confirmed = confirmedBooking("idem-pricing-amend");

        Booking amended = service.amend(confirmed.id(), Map.of("requestedDepartureDate", "2026-08-02"),
                "booking-user", "corr-pricing-amend");

        assertEquals(BookingStatus.AMENDED, amended.status());
        assertEquals(1, amended.pricingAmendmentSeq());
        assertEquals("REPRICE_REQUIRED", amended.attributes().get("pricingStatus"));
        assertEquals("2026-08-02", amended.attributes().get("requestedDepartureDate"));
        assertEquals(PricingInput.from(amended, 1).fingerprint(), amended.pricingInputFingerprint());
    }

    @Test
    void nonPricingAmendmentRetainsCurrentPriceEligibility() {
        Booking confirmed = confirmedBooking("idem-non-pricing-amend");

        Booking amended = service.amend(confirmed.id(), Map.of("note", "customer called"),
                "booking-user", "corr-non-pricing-amend");

        assertEquals(BookingStatus.AMENDED, amended.status());
        assertEquals(0, amended.pricingAmendmentSeq());
        assertEquals("PRICED", amended.attributes().get("pricingStatus"));
        assertEquals("customer called", amended.attributes().get("note"));
        assertEquals(PricingInput.from(amended, 0).fingerprint(), amended.pricingInputFingerprint());
    }

    @Test
    void requestPricingStoresImmediateChargeSnapshot() {
        BookingApplicationService pricedService = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                references(false),
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
    void manualPricingResponseIsVisibleManualPricingState() {
        BookingApplicationService manualService = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                references(false),
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.manual("price-req-manual",
                        "NO_ACTIVE_AGREEMENT", "Charge requires manual pricing", correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
        Booking booking = manualService.createDraft(command("idem-manual", "customer-1", "loc-origin", "loc-destination"));
        manualService.validate(booking.id(), "booking-user", "corr-manual");

        Booking manual = manualService.requestPricing(booking.id(), "booking-user", "price-idem-manual", "corr-manual");

        assertEquals(BookingStatus.MANUAL_PRICING, manual.status());
        assertEquals("price-req-manual", manual.attributes().get("manualPricingRequestId"));
        assertEquals("NO_ACTIVE_AGREEMENT", manual.attributes().get("manualPricingReasonCode"));
        assertEquals("Charge requires manual pricing", manual.attributes().get("manualPricingReasonMessage"));
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
                "ACT", "2026-07-01T00:05:00Z"));

        MovementStatusProjection projection = movementStatusProjections.findByBookingRef(booking.id().value()).get(0);
        assertEquals(booking.id(), moved.id());
        assertEquals("IN_TRANSIT", projection.derivedStatus());
        assertEquals("event-move-1", projection.eventId());
        assertNull(moved.attributes().get("movementStatus"));
    }

    @Test
    void duplicateMovementStatusDoesNotAddLifecycleEvidence() {
        Booking booking = confirmedBooking("idem-move-2");
        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1", "ACT",
                "2026-07-01T00:05:00Z"));

        Booking replay = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1",
                "ACT", "2026-07-01T00:05:00Z"));

        assertEquals(1, movementStatusProjections.receipts.size());
        assertEquals(booking.id(), replay.id());
        assertEquals("BOOKING_MOVEMENT_STATUS_DUPLICATE:SUCCESS:corr-move", audit.get(audit.size() - 1));
    }

    @Test
    void staleMovementStatusIsIgnoredBySequenceNumber() {
        Booking booking = confirmedBooking("idem-move-3");
        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-2", "move-2", "ACT",
                "2026-07-01T00:06:00Z"));

        Booking stale = service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1",
                "EST", "2026-07-01T00:05:00Z"));

        MovementStatusProjection projection = movementStatusProjections.findByBookingRef(booking.id().value()).get(0);
        assertEquals("event-move-2", projection.eventId());
        assertEquals(booking.id(), stale.id());
        assertEquals("BOOKING_MOVEMENT_STATUS_STALE:SUCCESS:corr-move", audit.get(audit.size() - 1));
    }

    @Test
    void strongerClassifierAtSameOccurredTimeWinsProjection() {
        Booking booking = confirmedBooking("idem-move-4");

        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-1", "move-1", "PLN",
                "2026-07-01T00:05:00Z"));
        service.consumeMovementStatus(movementStatus(booking.id(), "event-move-2", "move-2", "ACT",
                "2026-07-01T00:05:00Z"));

        MovementStatusProjection projection = movementStatusProjections.findByBookingRef(booking.id().value()).get(0);
        assertEquals("event-move-2", projection.eventId());
        assertEquals(3, projection.classifierRank());
    }

    @Test
    void deniedMovementStatusConsumerFailsClosed() {
        BookingApplicationService denied = new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> !"consume-movement-status".equals(action),
                references(false),
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                audit(),
                outbox::add,
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
        Booking booking = confirmedBooking("idem-move-denied");

        assertThrows(SecurityException.class,
                () -> denied.consumeMovementStatus(movementStatus(booking.id(), "event-move-denied", "move-denied",
                        "ACT", "2026-07-01T00:05:00Z")));
    }

    @Test
    void requestDndPricingStoresChargeResultSnapshot() {
        BookingApplicationService dndService = dndService(DndPricingResult.priced("dnd-ref-1", 4,
                Map.of("line.1", "DETENTION:60.00 USD"), "corr-dnd"));
        Booking booking = confirmedBookingWithService(dndService, "idem-dnd-1");
        dndService.consumeMovementStatus(movementStatus(booking.id(), "event-arrived", "move-arrived", "ACT",
                "2026-07-01T00:06:00Z"));

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
        return new CreateBookingCommand(idempotencyKey, customerId,
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")), "USD", "FCL_DRY", false, false,
                Map.of("requestedDepartureDate", "2026-08-01", "tradeLaneId", "NA-EU", "commodityCode", "GEN"),
                "booking-user", "corr-1");
    }

    private Booking confirmedBooking(String idempotencyKey) {
        return confirmedBookingWithService(service, idempotencyKey);
    }

    private Booking confirmedBookingWithService(BookingApplicationService targetService, String idempotencyKey) {
        Booking booking = targetService.createDraft(command(idempotencyKey, "customer-1", "loc-origin", "loc-destination"));
        targetService.validate(booking.id(), "booking-user", "corr-confirmed");
        targetService.requestPricing(booking.id(), "booking-user", idempotencyKey + "-pricing", "corr-confirmed");
        storeConfirmablePricing(booking.id(), "corr-confirmed");
        return targetService.confirm(booking.id(), "booking-user", idempotencyKey + "-confirm", "corr-confirmed");
    }

    private void storeConfirmablePricing(BookingId bookingId, String correlationId) {
        Booking booking = bookings.findById(bookingId).orElseThrow();
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "20.00"),
                line("THC", "LOCAL", "LOCAL", "5.00"));
        String inputFingerprint = PricingInput.from(booking, booking.pricingAmendmentSeq()).fingerprint();
        BookingPricingSnapshot snapshot = new BookingPricingSnapshot(
                2, "price-" + bookingId.value(), booking.bookingNumber(), booking.pricingAmendmentSeq(),
                booking.revision(), inputFingerprint, LocalDate.parse("2026-08-01"), "TARIFF", "tariff:NA-EU",
                null, lines, List.of(), new BigDecimal("125.00"), "USD",
                Instant.parse("2026-07-01T00:00:00Z"), correlationId, Instant.parse("2026-07-01T00:00:00Z"));
        bookings.save(booking.typedPriced(snapshot, "pricing-service", Instant.parse("2026-07-01T00:00:00Z")));
    }

    private PricingLineSnapshot line(String code, String category, String rateCategory, String amount) {
        BigDecimal money = new BigDecimal(amount);
        return new PricingLineSnapshot(
                code, category, rateCategory, "PER_CONTAINER", 1, money, money, "USD", "rate-version-1");
    }

    private BookingApplicationService dndService(DndPricingResult result) {
        return new BookingApplicationService(
                bookings,
                idempotency,
                (subjectId, resource, action, correlationId) -> true,
                references(true),
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                (booking, idempotencyKey, correlationId) -> result,
                audit(),
                outbox::add,
                new InMemoryMovementStatusProjections(),
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));
    }

    private MovementStatusReceivedEvent movementStatus(
            BookingId bookingId,
            String eventId,
            String movementId,
            String classifier,
            String occurredAt) {
        String status = "ACT".equals(classifier) ? "IN_TRANSIT" : "PLANNED";
        return new MovementStatusReceivedEvent(eventId, "containermovement.status",
                "container-movement-service", Instant.parse(occurredAt), "corr-move", 1,
                bookingId.value(), "MSCU6639870", movementId, "LOAD", classifier,
                Instant.parse(occurredAt), Instant.parse("2026-07-01T00:07:00Z"), status,
                "LADEN", false, new MovementLocation("SGSIN", null, null));
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
        private final Map<String, IdempotencyReceipt> receipts = new LinkedHashMap<>();

        public Optional<BookingId> findBookingId(String idempotencyKey) {
            return Optional.ofNullable(keys.get(idempotencyKey));
        }

        public void remember(String idempotencyKey, BookingId bookingId) {
            keys.put(idempotencyKey, bookingId);
        }

        public Optional<IdempotencyReceipt> findReceipt(String idempotencyKey) {
            return Optional.ofNullable(receipts.get(idempotencyKey));
        }

        public boolean claim(String idempotencyKey, String operation, String requestHash, BookingId bookingId) {
            if (receipts.containsKey(idempotencyKey)) {
                return false;
            }
            receipts.put(idempotencyKey, new IdempotencyReceipt(idempotencyKey, operation, requestHash, bookingId,
                    "IN_PROGRESS", null));
            return true;
        }

        public void complete(String idempotencyKey, int responseRevision) {
            IdempotencyReceipt current = receipts.get(idempotencyKey);
            receipts.put(idempotencyKey, new IdempotencyReceipt(current.idempotencyKey(), current.operation(),
                    current.requestHash(), current.bookingId(), "COMPLETED", responseRevision));
            keys.put(idempotencyKey, current.bookingId());
        }
    }

    private static class InMemoryMovementStatusProjections implements MovementStatusProjectionRepository {
        private final Map<String, MovementStatusProjection> projections = new LinkedHashMap<>();
        private final Map<String, ConsumedEventDisposition> receipts = new LinkedHashMap<>();

        public boolean insertReceipt(MovementStatusReceivedEvent event, Instant consumedAt) {
            if (receipts.containsKey(event.eventId())) {
                return false;
            }
            receipts.put(event.eventId(), null);
            return true;
        }

        public ProjectionUpsertResult upsert(MovementStatusProjection projection) {
            String key = projection.bookingRef() + ":" + projection.containerRef();
            MovementStatusProjection current = projections.get(key);
            boolean apply = current == null || compare(projection, current) > 0;
            if (apply) {
                projections.put(key, projection);
            }
            return new ProjectionUpsertResult(apply ? ConsumedEventDisposition.APPLIED : ConsumedEventDisposition.STALE,
                    projections.get(key));
        }

        public void markReceiptDisposition(String eventId, ConsumedEventDisposition disposition) {
            receipts.put(eventId, disposition);
        }

        public Optional<MovementStatusProjection> findLatest(String bookingRef, String containerRef) {
            return Optional.ofNullable(projections.get(bookingRef + ":" + containerRef));
        }

        public List<MovementStatusProjection> findByBookingRef(String bookingRef) {
            return projections.values().stream()
                    .filter(projection -> bookingRef.equals(projection.bookingRef()))
                    .toList();
        }

        private int compare(MovementStatusProjection left, MovementStatusProjection right) {
            int occurred = left.occurredDateTime().compareTo(right.occurredDateTime());
            if (occurred != 0) {
                return occurred;
            }
            int classifier = Integer.compare(left.classifierRank(), right.classifierRank());
            if (classifier != 0) {
                return classifier;
            }
            int received = left.receivedDateTime().compareTo(right.receivedDateTime());
            if (received != 0) {
                return received;
            }
            return left.eventId().compareTo(right.eventId());
        }
    }

    @Test
    void repeatedEquivalentValidationDoesNotDuplicateLifecycleOrAudit() {
        Booking booking = service.createDraft(command("idem-validation-replay", "customer-1", "unused", "unused"));
        Booking first = service.validate(booking.id(), "booking-user", "corr-validation-replay");
        int lifecycleCount = first.lifecycleEvents().size();
        int auditCount = audit.size();

        Booking replay = service.validate(booking.id(), "booking-user", "corr-validation-replay");

        assertEquals(lifecycleCount, replay.lifecycleEvents().size());
        assertEquals(auditCount, audit.size());
    }

    @Test
    void providerUnavailableAuditsAttemptWithoutChangingBooking() {
        BookingApplicationService unavailableService = new BookingApplicationService(
                bookings, idempotency, (subjectId, resource, action, correlationId) -> true,
                (request, correlationId) -> {
                    throw new ReferenceProviderUnavailable(ReferenceProviderFailureCategory.TIMEOUT,
                            "Reference Data is unavailable", correlationId, null);
                },
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                audit(), outbox::add, new SequentialIds(), Clock.systemUTC());
        Booking booking = unavailableService.createDraft(command("idem-validation-unavailable", "customer-1",
                "unused", "unused"));

        assertThrows(ReferenceProviderUnavailable.class,
                () -> unavailableService.validate(booking.id(), "booking-user", "corr-unavailable"));

        assertEquals(BookingStatus.DRAFT, bookings.findById(booking.id()).orElseThrow().status());
        assertEquals("BOOKING_VALIDATION_UNAVAILABLE:ERROR:corr-unavailable", audit.get(audit.size() - 1));
    }

    @Test
    void changedBookingRejectsStaleProviderResult() {
        ReferenceValidationPort changingReferences = (request, correlationId) -> {
            Booking original = bookings.findById(request.bookingId()).orElseThrow();
            bookings.save(Booking.draft(original.id(), original.bookingNumber(), "customer-changed",
                    original.routing(), original.equipment(), original.currency(), original.cargoMode(),
                    original.reefer(), original.dangerousGoods(), original.attributes(), "other-user",
                    "corr-change", Instant.parse("2026-07-01T00:00:01Z")));
            return references(false).validate(request, correlationId);
        };
        BookingApplicationService changingService = new BookingApplicationService(
                bookings, idempotency, (subjectId, resource, action, correlationId) -> true, changingReferences,
                (booking, idempotencyKey, correlationId) -> PricingRequestResult.pending("price-req-1", correlationId),
                audit(), outbox::add, new SequentialIds(), Clock.systemUTC());
        Booking booking = changingService.createDraft(command("idem-validation-stale", "customer-1", "unused", "unused"));

        assertThrows(BookingChangedException.class,
                () -> changingService.validate(booking.id(), "booking-user", "corr-stale"));
    }

    private static ReferenceValidationPort references(boolean rejectMissing) {
        return (request, correlationId) -> new ReferenceValidationResult(
                request.bookingRevision(), request.referenceFingerprint(), request.checks().stream().map(check -> {
                    boolean active = !rejectMissing || !check.requestedValue().startsWith("missing");
                    return new ReferenceFieldResult(check.fieldPath(), check.referenceSet().name(),
                            check.requestedValue(), active ? ReferenceValidationFieldOutcome.ACTIVE
                                    : ReferenceValidationFieldOutcome.NOT_FOUND,
                            active ? check.requestedValue() : null, active ? check.requestedValue() : null,
                            active ? 1L : null, active ? "REFERENCE_ACTIVE" : "REFERENCE_NOT_FOUND");
                }).toList(), Instant.parse("2026-07-01T00:00:00Z"), correlationId);
    }

    @Test
    void changedPayloadWithSameIdempotencyKeyConflicts() {
        service.createDraft(command("idem-conflict", "customer-1", "loc-origin", "loc-destination"));

        assertThrows(IdempotencyConflictException.class,
                () -> service.createDraft(command("idem-conflict", "customer-2", "loc-origin", "loc-destination")));
        assertEquals(1, bookings.records.size());
    }

    @Test
    void equivalentInProgressCommandReturnsRetryableConflict() {
        CreateBookingCommand command = command("idem-progress", "customer-1", "loc-origin", "loc-destination");
        service.createDraft(command);
        IdempotencyReceipt completed = idempotency.receipts.get("idem-progress");
        idempotency.receipts.put("idem-progress", new IdempotencyReceipt(completed.idempotencyKey(),
                completed.operation(), completed.requestHash(), completed.bookingId(), "IN_PROGRESS", null));

        assertThrows(CommandInProgressException.class, () -> service.createDraft(command));
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}
