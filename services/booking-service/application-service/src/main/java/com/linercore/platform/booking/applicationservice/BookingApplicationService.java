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
import com.linercore.platform.booking.applicationservice.port.IdempotencyReceipt;
import com.linercore.platform.booking.applicationservice.port.ConsumedEventDisposition;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjection;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjectionRepository;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.port.EventPublicationException;
import com.linercore.platform.booking.applicationservice.port.PricingOutcome;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.pricing.PricingInput;
import com.linercore.platform.booking.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.booking.applicationservice.query.PublishBatchResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.outbox.BookingEventMapper;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.BrokerMetadata;
import com.linercore.platform.booking.domain.outbox.EventPublicationStatusView;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

public class BookingApplicationService {
    private final BookingRepository bookings;
    private final IdempotencyRepository idempotency;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final BookingValidationStateService validationState;
    private final PricingPort pricing;
    private final DndPricingPort dndPricing;
    private final AuditRepository audit;
    private final OutboxRepository outbox;
    private final MovementStatusProjectionRepository movementStatusProjections;
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
            AuditRepository audit,
            OutboxRepository outbox,
            MovementStatusProjectionRepository movementStatusProjections,
            IdGenerator ids,
            Clock clock) {
        this(bookings, idempotency, authorization, referenceValidation, pricing, null, audit, outbox,
                movementStatusProjections, ids, clock, null, null,
                new BookingValidationStateService(bookings, audit, clock));
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
            MovementStatusProjectionRepository movementStatusProjections,
            IdGenerator ids,
            Clock clock) {
        this(bookings, idempotency, authorization, referenceValidation, pricing, dndPricing, audit, outbox,
                movementStatusProjections, ids, clock, null, null,
                new BookingValidationStateService(bookings, audit, clock));
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
        this(bookings, idempotency, authorization, referenceValidation, pricing, dndPricing, audit, outbox, ids,
                clock, publisher, schemaRegistry, new BookingValidationStateService(bookings, audit, clock));
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
            SchemaRegistryPort schemaRegistry,
            BookingValidationStateService validationState) {
        this(bookings, idempotency, authorization, referenceValidation, pricing, dndPricing, audit, outbox, null, ids,
                clock, publisher, schemaRegistry, validationState);
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
            MovementStatusProjectionRepository movementStatusProjections,
            IdGenerator ids,
            Clock clock,
            BookingEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry,
            BookingValidationStateService validationState) {
        this.bookings = bookings;
        this.idempotency = idempotency;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.validationState = validationState;
        this.pricing = pricing;
        this.dndPricing = dndPricing;
        this.audit = audit;
        this.outbox = outbox;
        this.movementStatusProjections = movementStatusProjections;
        this.ids = ids;
        this.clock = clock;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    @Transactional
    public Booking createDraft(CreateBookingCommand command) {
        requireAllowed(command.actorSubjectId(), "create", command.correlationId());
        validateIdempotencyKey(command.idempotencyKey());
        String requestHash = requestHash(command);
        Optional<IdempotencyReceipt> existing = idempotency.findReceipt(command.idempotencyKey());
        if (existing.isPresent()) {
            return resolveExisting(existing.get(), requestHash);
        }
        BookingId bookingId = new BookingId(ids.nextId());
        if (!idempotency.claim(command.idempotencyKey(), "CREATE", requestHash, bookingId)) {
            return resolveExisting(idempotency.findReceipt(command.idempotencyKey()).orElseThrow(), requestHash);
        }
        Booking booking = Booking.draft(bookingId, "BKG-" + ids.nextId(), command.customerId(),
                command.routing(), command.equipment(), command.currency(), command.cargoMode(), command.reefer(),
                command.dangerousGoods(), command.attributes(), command.actorSubjectId(), command.correlationId(), now());
        bookings.save(booking);
        audit.append("BOOKING_DRAFT_CREATED", booking.id().value(), command.actorSubjectId(), "SUCCESS", null, command.correlationId());
        idempotency.complete(command.idempotencyKey(), booking.revision());
        return booking;
    }

    public Booking validate(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "validate", correlationId);
        var request = validationState.capture(id);
        try {
            return validationState.apply(request, referenceValidation.validate(request, correlationId), actorSubjectId);
        } catch (ReferenceProviderUnavailable unavailable) {
            validationState.recordUnavailable(id, actorSubjectId, correlationId, unavailable.category().name());
            throw unavailable;
        }
    }

    public Booking requestPricing(BookingId id, String actorSubjectId, String idempotencyKey, String correlationId) {
        requireAllowed(actorSubjectId, "request-pricing", correlationId);
        Booking booking = bookings.findById(id).orElseThrow();
        String canonicalKey = booking.id().value() + ":" + booking.revision();
        PricingRequestResult result = pricing.requestPricing(booking, canonicalKey, correlationId);
        Booking next = toPricingState(booking, result, actorSubjectId);
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
    public Booking confirm(BookingId id, String actorSubjectId, String idempotencyKey, String correlationId) {
        requireAllowed(actorSubjectId, "confirm", correlationId);
        validateIdempotencyKey(idempotencyKey);
        Booking booking = bookings.findById(id).orElseThrow();
        String requestHash = lifecycleRequestHash("CONFIRM", booking);
        Optional<IdempotencyReceipt> existing = idempotency.findReceipt(idempotencyKey);
        if (existing.isPresent()) {
            return resolveExisting(existing.get(), "CONFIRM", requestHash, id);
        }
        if (!idempotency.claim(idempotencyKey, "CONFIRM", requestHash, id)) {
            return resolveExisting(idempotency.findReceipt(idempotencyKey).orElseThrow(), "CONFIRM", requestHash, id);
        }
        Booking next = booking.confirmed(actorSubjectId, correlationId, now());
        bookings.save(next);
        outbox.enqueue(eventMapper.confirmedEvent(ids.nextId(), next, correlationId, now()));
        audit.append("BOOKING_CONFIRMED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        idempotency.complete(idempotencyKey, next.revision());
        return next;
    }

    public Booking amend(BookingId id, Map<String, String> attributes, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "amend", correlationId);
        Booking booking = bookings.findById(id).orElseThrow();
        java.util.HashMap<String, String> mergedAttributes = new java.util.HashMap<>(booking.attributes());
        if (attributes != null) {
            mergedAttributes.putAll(attributes);
        }
        int currentAmendmentSeq = booking.pricingAmendmentSeq();
        PricingInput currentInput = PricingInput.from(booking, currentAmendmentSeq);
        PricingInput candidateInput = PricingInput.from(booking, mergedAttributes, currentAmendmentSeq);
        boolean pricingChanged = !currentInput.sameCommercialInput(candidateInput);
        PricingInput nextInput = candidateInput.withAmendmentSeq(
                currentAmendmentSeq + (pricingChanged ? 1 : 0));
        Booking next = booking.pricingInputsAmended(
                mergedAttributes,
                nextInput.fingerprint(),
                nextInput.requestedDepartureDate().toString(),
                actorSubjectId,
                correlationId,
                now());
        bookings.save(next);
        audit.append("BOOKING_AMENDED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    @Transactional
    public Booking reconfirm(BookingId id, String actorSubjectId, String idempotencyKey, String correlationId) {
        requireAllowed(actorSubjectId, "reconfirm", correlationId);
        validateIdempotencyKey(idempotencyKey);
        Booking booking = bookings.findById(id).orElseThrow();
        String requestHash = lifecycleRequestHash("RECONFIRM", booking);
        Optional<IdempotencyReceipt> existing = idempotency.findReceipt(idempotencyKey);
        if (existing.isPresent()) {
            return resolveExisting(existing.get(), "RECONFIRM", requestHash, id);
        }
        if (!idempotency.claim(idempotencyKey, "RECONFIRM", requestHash, id)) {
            return resolveExisting(idempotency.findReceipt(idempotencyKey).orElseThrow(), "RECONFIRM", requestHash, id);
        }
        Booking next = booking.reconfirmed(actorSubjectId, correlationId, now());
        bookings.save(next);
        outbox.enqueue(eventMapper.confirmedEvent(ids.nextId(), next, correlationId, now()));
        audit.append("BOOKING_RECONFIRMED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        idempotency.complete(idempotencyKey, next.revision());
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

    public List<Booking> search(
            String actorSubjectId,
            String correlationId,
            String search,
            BookingStatus status,
            int page,
            int size) {
        requireAllowed(actorSubjectId, "read", correlationId);
        return bookings.findPage(search, status, Math.max(0, page), Math.max(1, Math.min(size, 100)));
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

    @Transactional
    public Booking consumeMovementStatus(MovementStatusReceivedEvent event) {
        requireAllowed(event.source(), "consume-movement-status", event.correlationId());
        if (movementStatusProjections == null) {
            throw new IllegalStateException("movement status projection repository is not configured");
        }
        Booking booking = bookings.findByIdForUpdate(new BookingId(event.bookingRef())).orElseThrow();
        boolean containerMatches = booking.equipment().stream()
                .anyMatch(item -> event.containerRef().equals(item.equipmentId()));
        if (!containerMatches) {
            throw new IllegalArgumentException("movement status container is not assigned to booking");
        }
        if (!movementStatusProjections.insertReceipt(event, now())) {
            audit.append("BOOKING_MOVEMENT_STATUS_DUPLICATE", booking.id().value(), event.source(), "SUCCESS",
                    event.eventId(), event.correlationId());
            return booking;
        }
        var result = movementStatusProjections.upsert(MovementStatusProjection.from(event, now()));
        movementStatusProjections.markReceiptDisposition(event.eventId(), result.disposition());
        audit.append(result.disposition() == ConsumedEventDisposition.APPLIED
                        ? "BOOKING_MOVEMENT_STATUS_APPLIED"
                        : "BOOKING_MOVEMENT_STATUS_STALE",
                booking.id().value(), event.source(), "SUCCESS", event.eventId(), event.correlationId());
        return booking;
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
        String reasonCode = result.reasonCode() == null || result.reasonCode().isBlank()
                ? exceptionCode(result.outcome())
                : result.reasonCode();
        return pending.manualPricing(result.pricingRequestId(), reasonCode, exceptionMessage(result),
                actorSubjectId, result.correlationId(), now());
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

    public List<MovementStatusProjection> movementStatuses(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read", correlationId);
        if (movementStatusProjections == null) {
            return List.of();
        }
        return movementStatusProjections.findByBookingRef(id.value());
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private Booking resolveExisting(IdempotencyReceipt receipt, String requestHash) {
        return resolveExisting(receipt, "CREATE", requestHash, receipt.bookingId());
    }

    private Booking resolveExisting(IdempotencyReceipt receipt, String operation, String requestHash, BookingId bookingId) {
        if (!operation.equals(receipt.operation())
                || !requestHash.equals(receipt.requestHash())
                || !bookingId.equals(receipt.bookingId())) {
            throw new IdempotencyConflictException();
        }
        if (!"COMPLETED".equals(receipt.state())) {
            throw new CommandInProgressException();
        }
        return bookings.findById(receipt.bookingId()).orElseThrow();
    }

    private String lifecycleRequestHash(String operation, Booking booking) {
        String canonical = operation + '\u001f' + booking.id().value() + '\u001f' + booking.revision();
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private void validateIdempotencyKey(String key) {
        if (key == null || key.isBlank() || key.length() > 128 || !key.matches("[\\x21-\\x7E]+")) {
            throw new IllegalArgumentException("idempotency key must be 1-128 visible ASCII characters");
        }
    }

    private String requestHash(CreateBookingCommand command) {
        StringBuilder canonical = new StringBuilder();
        canonical.append(command.customerId().trim()).append('\u001f')
                .append(command.currency()).append('\u001f')
                .append(command.cargoMode()).append('\u001f')
                .append(command.reefer()).append('\u001f')
                .append(command.dangerousGoods());
        command.routing().forEach(leg -> canonical.append('\u001f').append(leg.legSequence())
                .append('\u001f').append(leg.loadUnLocode()).append('\u001f').append(leg.dischargeUnLocode())
                .append('\u001f').append(leg.voyageId()));
        command.equipment().forEach(item -> canonical.append('\u001f').append(item.equipmentTypeCode())
                .append('\u001f').append(item.quantity()).append('\u001f').append(item.equipmentId()));
        command.attributes().entrySet().stream().sorted(Map.Entry.comparingByKey())
                .forEach(entry -> canonical.append('\u001f').append(entry.getKey()).append('=')
                        .append(entry.getValue()));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(canonical.toString().getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
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
