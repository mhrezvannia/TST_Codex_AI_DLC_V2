package com.linercore.platform.containermovement.applicationservice;

import com.linercore.platform.containermovement.applicationservice.command.CaptureMovementCommand;
import com.linercore.platform.containermovement.applicationservice.command.CreateJourneyCommand;
import com.linercore.platform.containermovement.applicationservice.event.BookingConfirmedEvent;
import com.linercore.platform.containermovement.applicationservice.port.AuditRepository;
import com.linercore.platform.containermovement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.containermovement.applicationservice.port.AuthorizationPort.Decision;
import com.linercore.platform.containermovement.applicationservice.port.IdGenerator;
import com.linercore.platform.containermovement.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.containermovement.applicationservice.port.JourneyRepository;
import com.linercore.platform.containermovement.applicationservice.port.OutboxRepository;
import com.linercore.platform.containermovement.applicationservice.port.EventPublicationException;
import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.containermovement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.containermovement.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.containermovement.applicationservice.query.PublishBatchResult;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.CaptureDisabledReason;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.Dependency;
import com.linercore.platform.containermovement.applicationservice.query.JourneyReadResult.Freshness;
import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.DedupeKey;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEventMapper;
import com.linercore.platform.containermovement.domain.outbox.BrokerMetadata;
import com.linercore.platform.containermovement.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

public class ContainerMovementApplicationService {
    private final JourneyRepository journeys;
    private final IdempotencyRepository idempotency;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final AuditRepository audit;
    private final OutboxRepository outbox;
    private final IdGenerator ids;
    private final Clock clock;
    private final MovementEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;
    private final MovementStatusEventMapper eventMapper = new MovementStatusEventMapper();

    public ContainerMovementApplicationService(
            JourneyRepository journeys,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock) {
        this(journeys, idempotency, authorization, referenceValidation, audit, outbox, ids, clock, null, null);
    }

    public ContainerMovementApplicationService(
            JourneyRepository journeys,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock,
            MovementEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        this.journeys = journeys;
        this.idempotency = idempotency;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.audit = audit;
        this.outbox = outbox;
        this.ids = ids;
        this.clock = clock;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    @Transactional
    public ContainerJourney createJourney(CreateJourneyCommand command) {
        requireAllowed(command.actorSubjectId(), "create-journey", command.correlationId(), null);
        Optional<ContainerJourney> existing = idempotency.findJourneyId(command.idempotencyKey()).flatMap(journeys::findById);
        if (existing.isPresent()) {
            return existing.get();
        }
        validateRequired(command.bookingId(), "booking id is required");
        validateRequired(command.containerId(), "container id is required");
        validateRequired(command.idempotencyKey(), "idempotency key is required");
        validateRequired(command.correlationId(), "correlation id is required");
        if (command.routeLocationIds().isEmpty()) {
            throw new IllegalArgumentException("route locations are required");
        }
        List<String> inactiveLocations = referenceValidation.inactiveLocationIds(command.routeLocationIds(), command.correlationId());
        if (!inactiveLocations.isEmpty()) {
            audit.append("CMM_JOURNEY_REFERENCE_VALIDATION_FAILED", null, command.actorSubjectId(), "DENY",
                    String.join(",", inactiveLocations), command.correlationId());
            throw new IllegalArgumentException("inactive journey locations: " + String.join(",", inactiveLocations));
        }

        ContainerJourney journey = ContainerJourney.create(new JourneyId(ids.nextId()), command.bookingId(),
                command.containerId(), command.routeLocationIds(), now());
        journeys.save(journey);
        idempotency.rememberJourney(command.idempotencyKey(), journey.id());
        outbox.enqueue(eventMapper.statusEvent(ids.nextId(), journey, command.correlationId(), now()));
        audit.append("CMM_JOURNEY_CREATED", journey.id().value(), command.actorSubjectId(), "SUCCESS", null, command.correlationId());
        return journey;
    }

    @Transactional
    public ContainerJourney consumeBookingConfirmed(BookingConfirmedEvent event) {
        requireAllowed(event.source(), "consume-booking-confirmed", event.correlationId(), null);
        Optional<ContainerJourney> replay = idempotency.findJourneyId(event.idempotencyKey()).flatMap(journeys::findById);
        if (replay.isPresent()) {
            audit.append("CMM_BOOKING_CONFIRMED_DUPLICATE", replay.get().id().value(), event.source(), "SUCCESS",
                    event.eventId(), event.correlationId());
            return replay.get();
        }
        List<String> inactiveLocations = referenceValidation.inactiveLocationIds(event.routeLocationIds(), event.correlationId());
        if (!inactiveLocations.isEmpty()) {
            audit.append("CMM_BOOKING_CONFIRMED_REFERENCE_VALIDATION_FAILED", null, event.source(), "DENY",
                    String.join(",", inactiveLocations), event.correlationId());
            throw new IllegalArgumentException("inactive booking route locations: " + String.join(",", inactiveLocations));
        }

        Optional<ContainerJourney> existing = journeys.findByBookingId(event.bookingId());
        if (existing.isPresent() && event.bookingRevision() <= existing.get().bookingRevision()) {
            audit.append("CMM_BOOKING_CONFIRMED_STALE", existing.get().id().value(), event.source(), "SUCCESS",
                    event.eventId(), event.correlationId());
            idempotency.rememberJourney(event.idempotencyKey(), existing.get().id());
            return existing.get();
        }
        ContainerJourney next = existing
                .map(journey -> reconcileJourney(journey, event))
                .orElseGet(() -> ContainerJourney.create(new JourneyId(ids.nextId()), event.bookingId(),
                        event.bookingRevision(), event.journeyContainerId(), event.routeLocationIds(), now()));

        journeys.save(next);
        idempotency.rememberJourney(event.idempotencyKey(), next.id());
        if (existing.isEmpty() || event.bookingRevision() > existing.get().bookingRevision()) {
            outbox.enqueue(eventMapper.statusEvent(ids.nextId(), next, event.correlationId(), now()));
        }
        audit.append(existing.isPresent() ? "CMM_JOURNEY_RECONCILED_FROM_BOOKING" : "CMM_JOURNEY_CREATED_FROM_BOOKING",
                next.id().value(), event.source(), "SUCCESS", null, event.correlationId());
        return next;
    }

    @Transactional
    public ContainerJourney captureMovement(CaptureMovementCommand command) {
        requireAllowed(command.actorSubjectId(), "capture-movement", command.correlationId(), command.journeyId());
        validateRequired(command.journeyId(), "journey id is required");
        validateRequired(command.containerId(), "container id is required");
        validateRequired(command.locationId(), "location id is required");
        validateRequired(command.idempotencyKey(), "idempotency key is required");
        validateRequired(command.correlationId(), "correlation id is required");
        ContainerJourney journey = journeys.findById(new JourneyId(command.journeyId())).orElseThrow();
        if (idempotency.findMovementEventId(command.idempotencyKey()).isPresent()) {
            throw movementConflict(
                    "DUPLICATE_MOVEMENT",
                    "idempotency key has already been accepted",
                    journey,
                    command);
        }
        List<String> inactiveLocations = referenceValidation.inactiveLocationIds(List.of(command.locationId()), command.correlationId());
        if (!inactiveLocations.isEmpty()) {
            audit.append("CMM_MOVEMENT_REFERENCE_VALIDATION_FAILED", journey.id().value(), command.actorSubjectId(), "DENY",
                    String.join(",", inactiveLocations), command.correlationId());
            throw new IllegalArgumentException("inactive movement location: " + String.join(",", inactiveLocations));
        }

        String eventId = ids.nextId();
        MovementEvent event = new MovementEvent(eventId, command.eventType(), command.containerId(), command.locationId(),
                command.eventTime(), new DedupeKey(command.idempotencyKey()), command.correlationId());
        ContainerJourney next;
        try {
            next = journey.capture(event, clock);
        } catch (IllegalArgumentException ex) {
            String code = ex.getMessage() != null && ex.getMessage().contains("duplicate")
                    ? "DUPLICATE_MOVEMENT" : "OUT_OF_SEQUENCE_MOVEMENT";
            throw movementConflict(code, ex.getMessage(), journey, command);
        }
        journeys.save(next);
        idempotency.rememberMovement(command.idempotencyKey(), eventId);
        outbox.enqueue(eventMapper.statusEvent(ids.nextId(), next, command.correlationId(), now()));
        audit.append("CMM_MOVEMENT_CAPTURED", next.id().value(), command.actorSubjectId(), "SUCCESS", null, command.correlationId());
        return next;
    }

    private MovementConflictException movementConflict(
            String code,
            String message,
            ContainerJourney journey,
            CaptureMovementCommand command) {
        String current = journey.status().name();
        String requiredNext = journey.requiredNextMove();
        audit.appendDurableRejection("CMM_" + code, journey.id().value(), command.actorSubjectId(),
                "current=" + current + ";requiredNext=" + requiredNext, command.correlationId());
        return new MovementConflictException(
                code,
                message,
                current,
                requiredNext,
                command.correlationId());
    }

    public JourneyReadResult detail(String journeyId, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read", correlationId, journeyId);
        ContainerJourney result = journeys.findById(new JourneyId(journeyId)).orElseThrow();
        return readResult(result, actorSubjectId, correlationId, readMetadata(actorSubjectId, correlationId));
    }

    public JourneyReadResult detailByBookingId(String bookingId, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read", correlationId, null);
        ContainerJourney result = journeys.findByBookingId(bookingId).orElseThrow();
        return readResult(result, actorSubjectId, correlationId, readMetadata(actorSubjectId, correlationId));
    }

    public List<JourneyReadResult> recent(String actorSubjectId, String correlationId, int limit) {
        requireAllowed(actorSubjectId, "read", correlationId, null);
        List<ContainerJourney> result = journeys.findRecent(Math.max(1, Math.min(limit, 100)));
        ReadMetadata metadata = readMetadata(actorSubjectId, correlationId);
        return result.stream()
                .map(journey -> readResult(journey, actorSubjectId, correlationId, metadata))
                .toList();
    }

    public JourneyReadResult responseMetadata(
            ContainerJourney journey,
            String actorSubjectId,
            String correlationId) {
        return readResult(journey, actorSubjectId, correlationId, readMetadata(actorSubjectId, correlationId));
    }

    @Transactional
    public PublishBatchResult publishOutboxBatch(String workerId, int batchSize) {
        requireMessaging();
        if (workerId == null || workerId.isBlank()) {
            throw new IllegalArgumentException("worker id is required");
        }
        List<MovementStatusEvent> claimed = outbox.claimAvailable(
                workerId, now(), Math.max(1, Math.min(batchSize, 100)));
        int published = 0;
        int retryable = 0;
        int permanent = 0;
        for (MovementStatusEvent event : claimed) {
            try {
                schemaRegistry.ensureRegistered(event.eventType(), event.schemaVersion());
                BrokerMetadata metadata = publisher.publish(event);
                outbox.save(event.published(metadata));
                published++;
            } catch (EventPublicationException ex) {
                outbox.save(ex.retryable()
                        ? event.retryable(ex.code(), ex.getMessage(), now().plus(Duration.ofMinutes(5)))
                        : event.failedPermanent(ex.code(), ex.getMessage()));
                if (ex.retryable()) {
                    retryable++;
                } else {
                    permanent++;
                }
            } catch (RuntimeException ex) {
                outbox.save(event.retryable("PUBLISHER_UNAVAILABLE", ex.getMessage(),
                        now().plus(Duration.ofMinutes(5))));
                retryable++;
            }
        }
        return new PublishBatchResult(claimed.size(), published, retryable, permanent);
    }

    public List<EventPublicationStatusView> outboxStatuses(OutboxStatusQuery query) {
        if (outbox == null) {
            throw new IllegalStateException("outbox repository is not configured");
        }
        return outbox.findStatuses(query);
    }

    private void requireAllowed(String subjectId, String action, String correlationId, String journeyId) {
        if (!authorization.allowed(subjectId, "container-movement", action, correlationId)) {
            audit.append("CMM_AUTHORIZATION_DENIED", journeyId, subjectId, "DENY", action, correlationId);
            throw new SecurityException("container movement command denied");
        }
    }

    private void validateRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    private ContainerJourney reconcileJourney(ContainerJourney journey, BookingConfirmedEvent event) {
        return journey.reconcileBookingRevision(event.bookingRevision(), event.routeLocationIds(), now());
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private ReadMetadata readMetadata(String actorSubjectId, String correlationId) {
        Decision capability = authorization.decision(
                actorSubjectId, "container-movement", "capture-capability", correlationId);
        boolean captureAuthorized = capability == Decision.ALLOW;
        ReferenceValidationPort.Availability availability = referenceValidation.availability(correlationId);
        Instant checkedAt = availability.checkedAt() == null ? now() : availability.checkedAt();
        boolean referenceFresh = availability.state() == ReferenceValidationPort.State.FRESH;
        boolean captureEnabled = captureAuthorized && referenceFresh;
        CaptureDisabledReason disabledReason = null;
        Dependency dependency = Dependency.NONE;
        if (capability == Decision.UNAVAILABLE) {
            disabledReason = CaptureDisabledReason.CAPABILITY_UNAVAILABLE;
            dependency = Dependency.IDENTITY;
        } else if (!captureAuthorized) {
            disabledReason = CaptureDisabledReason.CAPTURE_NOT_AUTHORIZED;
            dependency = Dependency.IDENTITY;
        } else if (!referenceFresh) {
            disabledReason = availability.state() == ReferenceValidationPort.State.UNAVAILABLE
                    ? CaptureDisabledReason.REFERENCE_DATA_UNAVAILABLE
                    : CaptureDisabledReason.REFERENCE_DATA_LAST_KNOWN;
            dependency = Dependency.REFERENCE_DATA;
        }
        Freshness freshness = switch (availability.state()) {
            case FRESH -> Freshness.FRESH;
            case LAST_KNOWN -> Freshness.LAST_KNOWN;
            case UNAVAILABLE -> Freshness.UNAVAILABLE;
        };
        return new ReadMetadata(freshness, captureEnabled, disabledReason, dependency, checkedAt);
    }

    private JourneyReadResult readResult(
            ContainerJourney journey,
            String actorSubjectId,
            String correlationId,
            ReadMetadata metadata) {
        return new JourneyReadResult(
                journey,
                metadata.freshness(),
                journey.updatedAt(),
                metadata.captureEnabled(),
                metadata.captureDisabledReason(),
                metadata.dependency(),
                metadata.checkedAt());
    }

    private record ReadMetadata(
            Freshness freshness,
            boolean captureEnabled,
            CaptureDisabledReason captureDisabledReason,
            Dependency dependency,
            Instant checkedAt) {
    }

    private void requireMessaging() {
        if (outbox == null) {
            throw new IllegalStateException("outbox repository is not configured");
        }
        if (publisher == null || schemaRegistry == null) {
            throw new IllegalStateException("event publisher is not configured");
        }
    }

}
