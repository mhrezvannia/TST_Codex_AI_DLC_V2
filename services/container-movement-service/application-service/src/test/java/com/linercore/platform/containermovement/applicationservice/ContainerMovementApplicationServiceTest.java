package com.linercore.platform.containermovement.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.containermovement.applicationservice.command.CaptureMovementCommand;
import com.linercore.platform.containermovement.applicationservice.command.CreateJourneyCommand;
import com.linercore.platform.containermovement.applicationservice.event.BookingConfirmedEvent;
import com.linercore.platform.containermovement.applicationservice.port.AuditRepository;
import com.linercore.platform.containermovement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.containermovement.applicationservice.port.IdGenerator;
import com.linercore.platform.containermovement.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.containermovement.applicationservice.port.JourneyRepository;
import com.linercore.platform.containermovement.applicationservice.port.OutboxRepository;
import com.linercore.platform.containermovement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.CaptureDisabledReason;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.Dependency;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.Freshness;
import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import com.linercore.platform.containermovement.domain.model.MovementEventType;
import com.linercore.platform.containermovement.domain.model.MovementStatus;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ContainerMovementApplicationServiceTest {
    private final Instant now = Instant.parse("2026-07-01T00:00:00Z");
    private final FakeJourneyRepository journeys = new FakeJourneyRepository();
    private final FakeIdempotencyRepository idempotency = new FakeIdempotencyRepository();
    private final FakeAuditRepository audit = new FakeAuditRepository();
    private final FakeOutboxRepository outbox = new FakeOutboxRepository();
    private final FakeReferenceValidation referenceValidation = new FakeReferenceValidation();
    private final FakeAuthorization authorization = new FakeAuthorization();
    private final ContainerMovementApplicationService service = new ContainerMovementApplicationService(
            journeys,
            idempotency,
            authorization,
            referenceValidation,
            audit,
            outbox,
            new FakeIds("journey-1", "status-1", "movement-1", "status-2", "movement-2", "status-3"),
            Clock.fixed(now, ZoneOffset.UTC));

    @Test
    void createsJourneyWithExpectedMovementsAndStatusEvent() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));

        assertEquals("journey-1", journey.id().value());
        assertEquals(1, journey.bookingRevision());
        assertEquals(MovementStatus.ALLOCATED, journey.status());
        assertEquals(2, journey.expectedMovements().size());
        assertEquals("status-1", outbox.events.get(0).deduplicationKey());
        assertEquals("PLN", outbox.events.get(0).payload().get("data.eventClassifierCode"));
        assertEquals("LOAD", outbox.events.get(0).payload().get("data.moveCode"));
        assertEquals("CMM_JOURNEY_CREATED", audit.records.get(0).action);
    }

    @Test
    void replaysCreateJourneyByIdempotencyKey() {
        ContainerJourney first = service.createJourney(createCommand("create-1"));
        ContainerJourney replay = service.createJourney(createCommand("create-1"));

        assertSame(first, replay);
        assertEquals(1, journeys.records.size());
        assertEquals(1, outbox.events.size());
    }

    @Test
    void capturesMovementAndPublishesStatusEvidence() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));

        ContainerJourney moved = service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                MovementEventType.ACT_GTOT, "CONT0000001", "SGSIN", now,
                "local.cmm.operator", "move-1", "corr-1"));

        assertEquals(MovementStatus.GATED_OUT, moved.status());
        assertEquals(1, moved.history().size());
        MovementStatusEvent event = outbox.events.get(1);
        assertEquals("GATED_OUT", event.payload().get("data.derivedStatus"));
        assertEquals("GTOT", event.payload().get("data.moveCode"));
        assertEquals("ACT", event.payload().get("data.eventClassifierCode"));
        assertEquals("SGSIN", event.payload().get("data.location.unLocationCode"));
    }

    @Test
    void rejectsReplayedMovementRequestKeyAsTypedConflictWithEvidence() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                MovementEventType.ACT_GTOT, "CONT0000001", "SGSIN", now,
                "local.cmm.operator", "move-1", "corr-1"));

        MovementConflictException failure = assertThrows(MovementConflictException.class,
                () -> service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                        MovementEventType.ACT_GTOT, "CONT0000001", "SGSIN", now,
                        "local.cmm.operator", "move-1", "corr-replay")));

        assertEquals("DUPLICATE_MOVEMENT", failure.code());
        assertEquals("GATED_OUT", failure.current());
        assertEquals("LOAD", failure.requiredNext());
        assertEquals("corr-replay", failure.correlationId());
        assertEquals("CMM_DUPLICATE_MOVEMENT", audit.records.get(audit.records.size() - 1).action);
    }

    @Test
    void rejectsSameOccurrenceWithNewKeyAndWrongNextMove() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                MovementEventType.ACT_GTOT, "CONT0000001", "SGSIN", now,
                "local.cmm.operator", "move-1", "corr-1"));

        MovementConflictException duplicate = assertThrows(MovementConflictException.class,
                () -> service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                        MovementEventType.ACT_GTOT, "CONT0000001", "SGSIN", now,
                        "local.cmm.operator", "move-2", "corr-duplicate")));
        MovementConflictException wrongNext = assertThrows(MovementConflictException.class,
                () -> service.captureMovement(new CaptureMovementCommand(journey.id().value(),
                        MovementEventType.ACT_DISC, "CONT0000001", "NLRTM", now,
                        "local.cmm.operator", "move-3", "corr-sequence")));

        assertEquals("DUPLICATE_MOVEMENT", duplicate.code());
        assertEquals("OUT_OF_SEQUENCE_MOVEMENT", wrongNext.code());
        assertEquals("GATED_OUT", wrongNext.current());
        assertEquals("LOAD", wrongNext.requiredNext());
        assertEquals("corr-sequence", wrongNext.correlationId());
    }

    @Test
    void rejectsInactiveReferenceLocation() {
        referenceValidation.inactive.add("NLRTM");

        IllegalArgumentException failure = assertThrows(IllegalArgumentException.class,
                () -> service.createJourney(createCommand("create-1")));

        assertEquals("inactive journey locations: NLRTM", failure.getMessage());
        assertEquals("CMM_JOURNEY_REFERENCE_VALIDATION_FAILED", audit.records.get(0).action);
    }

    @Test
    void deniesUnauthorizedCommandsFailClosed() {
        authorization.authorized = false;

        assertThrows(SecurityException.class, () -> service.createJourney(createCommand("create-1")));

        assertEquals("CMM_AUTHORIZATION_DENIED", audit.records.get(0).action);
        assertEquals(0, journeys.records.size());
    }

    @Test
    void consumesBookingConfirmedAndCreatesJourney() {
        ContainerJourney journey = service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1",
                "SGSIN", "NLRTM"));

        assertEquals("journey-1", journey.id().value());
        assertEquals("booking-1", journey.bookingId());
        assertEquals(1, journey.bookingRevision());
        assertEquals("MSCU6639870", journey.containerId());
        assertEquals(2, journey.expectedMovements().size());
        assertEquals("CMM_JOURNEY_CREATED_FROM_BOOKING", audit.records.get(0).action);
        assertEquals(1, outbox.events.size());
    }

    @Test
    void replaysBookingConfirmedByIdempotencyKey() {
        ContainerJourney first = service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1",
                "SGSIN", "NLRTM"));
        ContainerJourney replay = service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1",
                "SGSIN", "NLRTM"));

        assertSame(first, replay);
        assertEquals(1, journeys.records.size());
        assertEquals(1, outbox.events.size());
        assertEquals("CMM_BOOKING_CONFIRMED_DUPLICATE", audit.records.get(1).action);
    }

    @Test
    void ignoresStaleBookingConfirmedRevision() {
        ContainerJourney first = service.consumeBookingConfirmed(bookingConfirmed("event-2", 2, "confirmed-2",
                "SGSIN", "AEJEA"));

        ContainerJourney stale = service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1",
                "SGSIN", "NLRTM"));

        assertSame(first, stale);
        assertEquals(2, stale.bookingRevision());
        assertEquals(1, outbox.events.size());
        assertEquals("CMM_BOOKING_CONFIRMED_STALE", audit.records.get(1).action);
    }

    @Test
    void reconcilesNewerBookingConfirmedRevision() {
        service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1", "SGSIN", "NLRTM"));

        ContainerJourney reconciled = service.consumeBookingConfirmed(bookingConfirmed("event-2", 2, "confirmed-2",
                "SGSIN", "AEJEA"));

        assertEquals(2, reconciled.bookingRevision());
        assertEquals("AEJEA", reconciled.expectedMovements().get(1).locationId());
        assertEquals(2, outbox.events.size());
        assertEquals("CMM_JOURNEY_RECONCILED_FROM_BOOKING", audit.records.get(1).action);
    }

    @Test
    void rejectsInactiveRouteFromBookingConfirmed() {
        referenceValidation.inactive.add("AEJEA");

        IllegalArgumentException failure = assertThrows(IllegalArgumentException.class,
                () -> service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1", "SGSIN", "AEJEA")));

        assertEquals("inactive booking route locations: AEJEA", failure.getMessage());
        assertEquals("CMM_BOOKING_CONFIRMED_REFERENCE_VALIDATION_FAILED", audit.records.get(0).action);
    }

    @Test
    void deniesUnauthorizedBookingConfirmedConsumer() {
        authorization.authorized = false;

        assertThrows(SecurityException.class,
                () -> service.consumeBookingConfirmed(bookingConfirmed("event-1", 1, "confirmed-1", "SGSIN", "NLRTM")));

        assertEquals("CMM_AUTHORIZATION_DENIED", audit.records.get(0).action);
        assertEquals(0, journeys.records.size());
    }

    @Test
    void evaluatesCaptureCapabilityOnceAfterProtectedDetailRead() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        authorization.actions.clear();

        JourneyReadResult result = service.detail(journey.id().value(), "local.cmm.operator", "corr-read");

        assertEquals(List.of("read", "capture-capability"), authorization.actions);
        assertEquals(Freshness.FRESH, result.freshness());
        assertEquals(now, result.dataUpdatedAt());
        assertEquals(now, result.checkedAt());
        assertEquals(true, result.captureEnabled());
        assertEquals(Dependency.NONE, result.dependency());
    }

    @Test
    void returnsTruthfulLastKnownMetadataAndDisablesCapture() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        referenceValidation.availability = new ReferenceValidationPort.Availability(
                ReferenceValidationPort.State.LAST_KNOWN,
                "REFERENCE_DATA_TIMEOUT",
                now.minusSeconds(30));
        authorization.actions.clear();

        JourneyReadResult result = service.detail(journey.id().value(), "local.cmm.operator", "corr-read");

        assertEquals(List.of("read", "capture-capability"), authorization.actions);
        assertEquals(Freshness.LAST_KNOWN, result.freshness());
        assertEquals(false, result.captureEnabled());
        assertEquals(CaptureDisabledReason.REFERENCE_DATA_LAST_KNOWN, result.captureDisabledReason());
        assertEquals(Dependency.REFERENCE_DATA, result.dependency());
        assertEquals(now.minusSeconds(30), result.checkedAt());
    }

    @Test
    void evaluatesListCapabilityOnceAndSharesBoundedMetadata() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        ContainerJourney second = ContainerJourney.create(
                new JourneyId("journey-2"), "booking-2", "CONT0000002", List.of("SGSIN", "NLRTM"), now);
        journeys.recent = List.of(journey, second);
        authorization.actions.clear();

        List<JourneyReadResult> results = service.recent("local.cmm.operator", "corr-list", 25);

        assertEquals(2, results.size());
        assertEquals(List.of("read", "capture-capability"), authorization.actions);
        assertEquals(Freshness.FRESH, results.get(0).freshness());
    }

    @Test
    void unavailableReferenceDataDisablesCaptureWithoutBusinessWrites() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        int journeyWrites = journeys.saveCount;
        int outboxWrites = outbox.events.size();
        referenceValidation.availability = new ReferenceValidationPort.Availability(
                ReferenceValidationPort.State.UNAVAILABLE,
                "adapter detail must not leak",
                now.minusSeconds(10));

        JourneyReadResult result = service.detailByBookingId(
                journey.bookingId(), "local.cmm.operator", "corr-booking");

        assertEquals(Freshness.UNAVAILABLE, result.freshness());
        assertEquals(CaptureDisabledReason.REFERENCE_DATA_UNAVAILABLE, result.captureDisabledReason());
        assertEquals(Dependency.REFERENCE_DATA, result.dependency());
        assertEquals(journeyWrites, journeys.saveCount);
        assertEquals(outboxWrites, outbox.events.size());
    }

    @Test
    void capabilityOutageIsDistinctFromAuthorizationDenial() {
        ContainerJourney journey = service.createJourney(createCommand("create-1"));
        authorization.capabilityDecision = AuthorizationPort.Decision.UNAVAILABLE;

        JourneyReadResult result = service.responseMetadata(
                journey, "local.cmm.operator", "corr-response");

        assertEquals(false, result.captureEnabled());
        assertEquals(CaptureDisabledReason.CAPABILITY_UNAVAILABLE, result.captureDisabledReason());
        assertEquals(Dependency.IDENTITY, result.dependency());
    }

    private CreateJourneyCommand createCommand(String idempotencyKey) {
        return new CreateJourneyCommand("booking-1", "CONT0000001", List.of("SGSIN", "NLRTM"),
                "local.cmm.operator", idempotencyKey, "corr-1");
    }

    private BookingConfirmedEvent bookingConfirmed(String eventId, int revision, String idempotencyKey, String origin, String destination) {
        return new BookingConfirmedEvent(eventId, "booking.confirmed", "1.0.0", "booking-service",
                now, "corr-1", idempotencyKey, "booking-1", revision, "quote-1", "customer-1",
                origin, destination, "MSCU6639870", "40HC");
    }

    private static class FakeJourneyRepository implements JourneyRepository {
        final Map<JourneyId, ContainerJourney> records = new HashMap<>();
        List<ContainerJourney> recent = List.of();
        int saveCount;

        public ContainerJourney save(ContainerJourney journey) {
            saveCount++;
            records.put(journey.id(), journey);
            return journey;
        }

        public Optional<ContainerJourney> findById(JourneyId id) {
            return Optional.ofNullable(records.get(id));
        }

        public Optional<ContainerJourney> findByBookingId(String bookingId) {
            return records.values().stream()
                    .filter(journey -> journey.bookingId().equals(bookingId))
                    .findFirst();
        }

        public List<ContainerJourney> findRecent(int limit) {
            return recent.stream().limit(limit).toList();
        }
    }

    private static class FakeIdempotencyRepository implements IdempotencyRepository {
        final Map<String, JourneyId> journeys = new HashMap<>();
        final Map<String, String> movements = new HashMap<>();

        public Optional<JourneyId> findJourneyId(String idempotencyKey) {
            return Optional.ofNullable(journeys.get(idempotencyKey));
        }

        public Optional<String> findMovementEventId(String idempotencyKey) {
            return Optional.ofNullable(movements.get(idempotencyKey));
        }

        public void rememberJourney(String idempotencyKey, JourneyId journeyId) {
            journeys.put(idempotencyKey, journeyId);
        }

        public void rememberMovement(String idempotencyKey, String eventId) {
            movements.put(idempotencyKey, eventId);
        }
    }

    private static class FakeReferenceValidation implements ReferenceValidationPort {
        final List<String> inactive = new ArrayList<>();
        Availability availability = new Availability(State.FRESH, null, null);

        public List<String> inactiveLocationIds(List<String> locationIds, String correlationId) {
            return locationIds.stream().filter(inactive::contains).toList();
        }

        public Availability availability(String correlationId) {
            return availability;
        }
    }

    private static class FakeAuthorization implements AuthorizationPort {
        boolean authorized = true;
        Decision capabilityDecision = Decision.ALLOW;
        final List<String> actions = new ArrayList<>();

        public boolean allowed(String subjectId, String resource, String action, String correlationId) {
            actions.add(action);
            return authorized;
        }

        public Decision decision(String subjectId, String resource, String action, String correlationId) {
            actions.add(action);
            return "capture-capability".equals(action)
                    ? capabilityDecision
                    : (authorized ? Decision.ALLOW : Decision.DENY);
        }
    }

    private static class FakeAuditRepository implements AuditRepository {
        final List<AuditRecord> records = new ArrayList<>();

        public void append(String action, String journeyId, String actorSubjectId, String outcome, String reasonCode, String correlationId) {
            records.add(new AuditRecord(action, journeyId, actorSubjectId, outcome, reasonCode, correlationId));
        }
    }

    private record AuditRecord(String action, String journeyId, String actorSubjectId, String outcome, String reasonCode, String correlationId) {
    }

    private static class FakeOutboxRepository implements OutboxRepository {
        final List<MovementStatusEvent> events = new ArrayList<>();

        public void enqueue(MovementStatusEvent event) {
            events.add(event);
        }
    }

    private static class FakeIds implements IdGenerator {
        private final ArrayDeque<String> ids;

        FakeIds(String... ids) {
            this.ids = new ArrayDeque<>(List.of(ids));
        }

        public String nextId() {
            return ids.removeFirst();
        }
    }
}
