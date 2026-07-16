package com.linercore.platform.booking.applicationservice;

import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.DndPricingOutcome;
import com.linercore.platform.booking.applicationservice.port.DndPricingPort;
import com.linercore.platform.booking.applicationservice.port.DndPricingResult;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.port.EventPublicationException;
import com.linercore.platform.booking.applicationservice.port.PricingOutcome;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.booking.applicationservice.query.PublishBatchResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.outbox.BookingEventMapper;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.BrokerMetadata;
import com.linercore.platform.booking.domain.outbox.EventPublicationStatusView;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

public class BookingApplicationService {
    private final BookingRepository bookings;
    private final IdempotencyRepository idempotency;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final PricingPort pricing;
    private final DndPricingPort dndPricing;
    private final AuditRepository audit;
    private final OutboxRepository outbox;
    private final IdGenerator ids;
    private final Clock clock;
    private final BookingEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;
    private final BookingEventMapper eventMapper = new BookingEventMapper();

    public BookingApplicationService(
            BookingRepository bookings,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            PricingPort pricing,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock) {
        this(bookings, idempotency, authorization, referenceValidation, pricing, null, audit, outbox, ids, clock,
                null, null);
    }

    public BookingApplicationService(
            BookingRepository bookings,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            PricingPort pricing,
            DndPricingPort dndPricing,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock) {
        this(bookings, idempotency, authorization, referenceValidation, pricing, dndPricing, audit, outbox, ids,
                clock, null, null);
    }

    public BookingApplicationService(
            BookingRepository bookings,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            PricingPort pricing,
            DndPricingPort dndPricing,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock,
            BookingEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        this.bookings = bookings;
        this.idempotency = idempotency;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.pricing = pricing;
        this.dndPricing = dndPricing;
        this.audit = audit;
        this.outbox = outbox;
        this.ids = ids;
        this.clock = clock;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    public Booking createDraft(CreateBookingCommand command) {
        requireAllowed(command.actorSubjectId(), "create", command.correlationId());
        Optional<BookingId> existing = idempotency.findBookingId(command.idempotencyKey());
        if (existing.isPresent()) {
            return bookings.findById(existing.get()).orElseThrow();
        }
        Booking booking = Booking.draft(new BookingId(ids.nextId()), "BKG-" + ids.nextId(), command.customerId(),
                command.originLocationId(), command.destinationLocationId(), command.equipmentType(), command.attributes(),
                command.actorSubjectId(), command.correlationId(), now());
        bookings.save(booking);
        idempotency.remember(command.idempotencyKey(), booking.id());
        audit.append("BOOKING_DRAFT_CREATED", booking.id().value(), command.actorSubjectId(), "SUCCESS", null, command.correlationId());
        return booking;
    }

    public Booking validate(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "validate", correlationId);
        Booking booking = bookings.findById(id).orElseThrow();
        boolean valid = referenceValidation.activeReference("party-customer", booking.customerId(), correlationId)
                && referenceValidation.activeReference("location", booking.originLocationId(), correlationId)
                && referenceValidation.activeReference("location", booking.destinationLocationId(), correlationId)
                && referenceValidation.activeReference("equipment-type", booking.equipmentType(), correlationId);
        Booking next = valid
                ? booking.validated(actorSubjectId, correlationId, now())
                : booking.exception("REFERENCE_VALIDATION_FAILED", "required booking references are not active", actorSubjectId, correlationId, now());
        bookings.save(next);
        audit.append("BOOKING_VALIDATED", id.value(), actorSubjectId, valid ? "SUCCESS" : "DENY", valid ? null : "REFERENCE_VALIDATION_FAILED", correlationId);
        return next;
    }

    public Booking requestPricing(BookingId id, String actorSubjectId, String idempotencyKey, String correlationId) {
        requireAllowed(actorSubjectId, "request-pricing", correlationId);
        Booking booking = bookings.findById(id).orElseThrow();
        PricingRequestResult result = pricing.requestPricing(booking, idempotencyKey, correlationId);
        Booking pending = booking.pricingPending(result.pricingRequestId(), actorSubjectId, correlationId, now());
        Booking next = toPricingState(pending, result, actorSubjectId);
        bookings.save(next);
        audit.append("BOOKING_PRICING_REQUESTED", id.value(), actorSubjectId, auditResult(result.outcome()),
                result.reasonCode(), correlationId);
        return next;
    }

    public Booking storePricingSnapshot(BookingId id, PricingSnapshotCommand command) {
        Booking booking = bookings.findById(id).orElseThrow();
        Booking next = booking.priced(new PricingSnapshot(command.pricingRequestId(), command.pricingQuoteId(),
                command.status(), command.quotedAmounts(), now(), command.correlationId()), command.actorSubjectId(), now());
        bookings.save(next);
        audit.append("BOOKING_PRICING_STORED", id.value(), command.actorSubjectId(), "SUCCESS", null, command.correlationId());
        return next;
    }

    @Transactional
    public Booking confirm(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "confirm", correlationId);
        Booking next = bookings.findById(id).orElseThrow().confirmed(actorSubjectId, correlationId, now());
        bookings.save(next);
        outbox.enqueue(eventMapper.confirmedEvent(ids.nextId(), next, correlationId, now()));
        audit.append("BOOKING_CONFIRMED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    public Booking amend(BookingId id, Map<String, String> attributes, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "amend", correlationId);
        Booking next = bookings.findById(id).orElseThrow().amended(attributes, actorSubjectId, correlationId, now());
        bookings.save(next);
        audit.append("BOOKING_AMENDED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    @Transactional
    public Booking reconfirm(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "reconfirm", correlationId);
        Booking next = bookings.findById(id).orElseThrow().reconfirmed(actorSubjectId, correlationId, now());
        bookings.save(next);
        outbox.enqueue(eventMapper.confirmedEvent(ids.nextId(), next, correlationId, now()));
        audit.append("BOOKING_RECONFIRMED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    @Transactional
    public PublishBatchResult publishOutboxBatch(String workerId, int batchSize) {
        requireMessaging();
        if (workerId == null || workerId.isBlank()) {
            throw new IllegalArgumentException("worker id is required");
        }
        List<BookingOutboxEvent> claimed = outbox.claimAvailable(
                workerId, now(), Math.max(1, Math.min(batchSize, 100)));
        int published = 0;
        int retryable = 0;
        int permanent = 0;
        for (BookingOutboxEvent event : claimed) {
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

    public Booking detail(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read", correlationId);
        return bookings.findById(id).orElseThrow();
    }

    public List<Booking> recent(String actorSubjectId, String correlationId, int limit) {
        requireAllowed(actorSubjectId, "read", correlationId);
        return bookings.findRecent(Math.max(1, Math.min(limit, 100)));
    }

    public Booking recordDndTriggerCandidate(BookingId id, String reason, String actorSubjectId, String correlationId) {
        Booking next = bookings.findById(id).orElseThrow()
                .dndTriggerCandidate(ids.nextId(), reason, actorSubjectId, correlationId, now());
        bookings.save(next);
        audit.append("BOOKING_DND_TRIGGER_CANDIDATE_RECORDED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    public Booking requestDndPricing(BookingId id, String actorSubjectId, String idempotencyKey, String correlationId) {
        requireAllowed(actorSubjectId, "request-dnd-pricing", correlationId);
        if (dndPricing == null) {
            throw new IllegalStateException("dnd pricing port is not configured");
        }
        Booking booking = bookings.findById(id).orElseThrow();
        DndPricingResult result = dndPricing.requestDndPricing(booking, idempotencyKey, correlationId);
        Booking next = toDndPricingState(booking, result, actorSubjectId);
        bookings.save(next);
        audit.append("BOOKING_DND_PRICING_REQUESTED", id.value(), actorSubjectId, dndAuditResult(result.outcome()),
                result.reasonCode(), correlationId);
        return next;
    }

    public Booking consumeMovementStatus(MovementStatusReceivedEvent event) {
        requireAllowed(event.source(), "consume-movement-status", event.correlationId());
        Booking booking = bookings.findById(new BookingId(event.bookingId())).orElseThrow();
        Optional<BookingId> replay = idempotency.findBookingId(event.idempotencyKey());
        if (replay.isPresent()) {
            audit.append("BOOKING_MOVEMENT_STATUS_DUPLICATE", booking.id().value(), event.source(), "SUCCESS",
                    event.eventId(), event.correlationId());
            return booking;
        }
        long currentSequence = movementSequence(booking);
        if (event.sequenceNumber() <= currentSequence) {
            idempotency.remember(event.idempotencyKey(), booking.id());
            audit.append("BOOKING_MOVEMENT_STATUS_STALE", booking.id().value(), event.source(), "SUCCESS",
                    event.eventId(), event.correlationId());
            return booking;
        }
        Booking next = booking.movementStatusObserved(event.containerId(), event.movementStatus(), event.sequenceNumber(),
                event.statusReason(), event.lastKnownLocationId(), event.source(), event.correlationId(), now());
        if (isDndTriggerInput(event)) {
            next = next.dndTriggerCandidate(ids.nextId(),
                    "movement status " + event.movementStatus() + " at " + event.lastKnownLocationId(),
                    event.source(), event.correlationId(), now());
        }
        bookings.save(next);
        idempotency.remember(event.idempotencyKey(), booking.id());
        audit.append("BOOKING_MOVEMENT_STATUS_CONSUMED", booking.id().value(), event.source(), "SUCCESS", null, event.correlationId());
        return next;
    }

    private void requireAllowed(String subjectId, String action, String correlationId) {
        if (!authorization.allowed(subjectId, "booking", action, correlationId)) {
            audit.append("BOOKING_AUTHORIZATION_DENIED", null, subjectId, "DENY", action, correlationId);
            throw new SecurityException("booking command denied");
        }
    }

    private Booking toPricingState(Booking pending, PricingRequestResult result, String actorSubjectId) {
        if (result.outcome() == PricingOutcome.PENDING) {
            return pending;
        }
        if (result.outcome() == PricingOutcome.PRICED) {
            return pending.priced(new PricingSnapshot(result.pricingRequestId(), result.pricingQuoteId(),
                    "QUOTED", result.quotedAmounts(), now(), result.correlationId()), actorSubjectId, now());
        }
        return pending.exception(exceptionCode(result.outcome()), exceptionMessage(result), actorSubjectId,
                result.correlationId(), now());
    }

    private String exceptionCode(PricingOutcome outcome) {
        return switch (outcome) {
            case MANUAL_REQUIRED -> "MANUAL_PRICING_REQUIRED";
            case TRANSIENT_FAILURE -> "PRICING_TEMPORARILY_UNAVAILABLE";
            case DENIED -> "PRICING_AUTHORIZATION_DENIED";
            case VALIDATION_FAILED -> "PRICING_VALIDATION_FAILED";
            case PENDING -> throw new IllegalArgumentException("pending outcome is not an exception");
            case PRICED -> throw new IllegalArgumentException("priced outcome is not an exception");
        };
    }

    private String exceptionMessage(PricingRequestResult result) {
        if (result.reasonMessage() != null && !result.reasonMessage().isBlank()) {
            return result.reasonMessage();
        }
        if (result.reasonCode() != null && !result.reasonCode().isBlank()) {
            return result.reasonCode();
        }
        return result.outcome().name();
    }

    private String auditResult(PricingOutcome outcome) {
        return switch (outcome) {
            case PENDING, PRICED -> "SUCCESS";
            case DENIED -> "DENY";
            case MANUAL_REQUIRED, TRANSIENT_FAILURE, VALIDATION_FAILED -> "EXCEPTION";
        };
    }

    private Booking toDndPricingState(Booking booking, DndPricingResult result, String actorSubjectId) {
        if (result.outcome() == DndPricingOutcome.PRICED) {
            return booking.dndPricingObserved(result.dndPricingRef(), result.chargeableDays(), result.lineItems(),
                    "PRICED", actorSubjectId, result.correlationId(), now());
        }
        return booking.exception(dndExceptionCode(result.outcome()), exceptionMessage(result.reasonCode(), result.reasonMessage()),
                actorSubjectId, result.correlationId(), now());
    }

    private String dndExceptionCode(DndPricingOutcome outcome) {
        return switch (outcome) {
            case MANUAL_REQUIRED -> "DND_MANUAL_PRICING_REQUIRED";
            case TRANSIENT_FAILURE -> "DND_PRICING_TEMPORARILY_UNAVAILABLE";
            case DENIED -> "DND_PRICING_AUTHORIZATION_DENIED";
            case VALIDATION_FAILED -> "DND_PRICING_VALIDATION_FAILED";
            case PRICED -> throw new IllegalArgumentException("priced outcome is not an exception");
        };
    }

    private String exceptionMessage(String reasonCode, String reasonMessage) {
        if (reasonMessage != null && !reasonMessage.isBlank()) {
            return reasonMessage;
        }
        return reasonCode == null || reasonCode.isBlank() ? "DND_PRICING_EXCEPTION" : reasonCode;
    }

    private String dndAuditResult(DndPricingOutcome outcome) {
        return switch (outcome) {
            case PRICED -> "SUCCESS";
            case DENIED -> "DENY";
            case MANUAL_REQUIRED, TRANSIENT_FAILURE, VALIDATION_FAILED -> "EXCEPTION";
        };
    }

    private long movementSequence(Booking booking) {
        try {
            return Long.parseLong(booking.attributes().getOrDefault("movementSequenceNumber", "-1"));
        } catch (NumberFormatException ex) {
            return -1;
        }
    }

    private boolean isDndTriggerInput(MovementStatusReceivedEvent event) {
        return "ARRIVED".equals(event.movementStatus()) || "DELIVERED".equals(event.movementStatus());
    }

    private Instant now() {
        return Instant.now(clock);
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
