package com.linercore.platform.booking.applicationservice;

import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.outbox.BookingEventMapper;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

public class BookingApplicationService {
    private final BookingRepository bookings;
    private final IdempotencyRepository idempotency;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final PricingPort pricing;
    private final AuditRepository audit;
    private final OutboxRepository outbox;
    private final IdGenerator ids;
    private final Clock clock;
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
        this.bookings = bookings;
        this.idempotency = idempotency;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.pricing = pricing;
        this.audit = audit;
        this.outbox = outbox;
        this.ids = ids;
        this.clock = clock;
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
        String pricingRequestId = pricing.requestPricing(booking, idempotencyKey, correlationId);
        Booking next = booking.pricingPending(pricingRequestId, actorSubjectId, correlationId, now());
        bookings.save(next);
        audit.append("BOOKING_PRICING_REQUESTED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
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

    public Booking confirm(BookingId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "confirm", correlationId);
        Booking next = bookings.findById(id).orElseThrow().confirmed(actorSubjectId, correlationId, now());
        bookings.save(next);
        outbox.enqueue(eventMapper.confirmedEvent(ids.nextId(), next, correlationId, now()));
        audit.append("BOOKING_CONFIRMED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    public Booking recordDndTriggerCandidate(BookingId id, String reason, String actorSubjectId, String correlationId) {
        Booking next = bookings.findById(id).orElseThrow()
                .dndTriggerCandidate(ids.nextId(), reason, actorSubjectId, correlationId, now());
        bookings.save(next);
        audit.append("BOOKING_DND_TRIGGER_CANDIDATE_RECORDED", id.value(), actorSubjectId, "SUCCESS", null, correlationId);
        return next;
    }

    private void requireAllowed(String subjectId, String action, String correlationId) {
        if (!authorization.allowed(subjectId, "booking", action, correlationId)) {
            audit.append("BOOKING_AUTHORIZATION_DENIED", null, subjectId, "DENY", action, correlationId);
            throw new SecurityException("booking command denied");
        }
    }

    private Instant now() {
        return Instant.now(clock);
    }
}
