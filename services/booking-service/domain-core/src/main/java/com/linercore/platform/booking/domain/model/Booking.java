package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public record Booking(
        BookingId id,
        String bookingNumber,
        int revision,
        BookingStatus status,
        String customerId,
        String originLocationId,
        String destinationLocationId,
        String equipmentType,
        PricingSnapshot pricingSnapshot,
        List<BookingException> exceptions,
        List<DndTriggerCandidate> dndTriggerCandidates,
        List<LifecycleEvent> lifecycleEvents,
        Map<String, String> attributes) {

    public Booking {
        if (bookingNumber == null || bookingNumber.isBlank()) {
            throw new IllegalArgumentException("booking number is required");
        }
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("customer id is required");
        }
        if (originLocationId == null || originLocationId.isBlank() || destinationLocationId == null || destinationLocationId.isBlank()) {
            throw new IllegalArgumentException("origin and destination are required");
        }
        exceptions = List.copyOf(exceptions == null ? List.of() : exceptions);
        dndTriggerCandidates = List.copyOf(dndTriggerCandidates == null ? List.of() : dndTriggerCandidates);
        lifecycleEvents = List.copyOf(lifecycleEvents == null ? List.of() : lifecycleEvents);
        attributes = Map.copyOf(attributes == null ? Map.of() : attributes);
    }

    public static Booking draft(
            BookingId id,
            String bookingNumber,
            String customerId,
            String originLocationId,
            String destinationLocationId,
            String equipmentType,
            Map<String, String> attributes,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        return new Booking(id, bookingNumber, 1, BookingStatus.DRAFT, customerId, originLocationId, destinationLocationId,
                equipmentType, null, List.of(), List.of(),
                List.of(event("BOOKING_DRAFT_CREATED", BookingStatus.DRAFT, 1, actorSubjectId, correlationId, now)),
                attributes);
    }

    public Booking validated(String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.DRAFT, BookingStatus.EXCEPTION);
        return withStatus(BookingStatus.VALIDATED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_VALIDATED");
    }

    public Booking pricingPending(String pricingRequestId, String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.VALIDATED);
        return withStatus(BookingStatus.PRICING_PENDING, revision, actorSubjectId, correlationId, now, null,
                exceptions, dndTriggerCandidates, withAttribute("pricingRequestId", pricingRequestId), "BOOKING_PRICING_REQUESTED");
    }

    public Booking priced(PricingSnapshot snapshot, String actorSubjectId, Instant now) {
        requireStatus(BookingStatus.PRICING_PENDING);
        return withStatus(BookingStatus.PRICED, revision, actorSubjectId, snapshot.correlationId(), now, snapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_PRICING_STORED");
    }

    public Booking confirmed(String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.PRICED);
        return withStatus(BookingStatus.CONFIRMED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_CONFIRMED");
    }

    public Booking amended(Map<String, String> nextAttributes, String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.CONFIRMED, BookingStatus.RECONFIRMED);
        return withStatus(BookingStatus.AMENDED, revision + 1, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, nextAttributes, "BOOKING_AMENDED");
    }

    public Booking reconfirmed(String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.AMENDED);
        return withStatus(BookingStatus.RECONFIRMED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_RECONFIRMED");
    }

    public Booking exception(String code, String message, String actorSubjectId, String correlationId, Instant now) {
        List<BookingException> next = new ArrayList<>(exceptions);
        next.add(new BookingException(code, message, correlationId, now));
        return withStatus(BookingStatus.EXCEPTION, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                next, dndTriggerCandidates, attributes, "BOOKING_EXCEPTION_RECORDED");
    }

    public Booking dndTriggerCandidate(String candidateId, String reason, String actorSubjectId, String correlationId, Instant now) {
        List<DndTriggerCandidate> next = new ArrayList<>(dndTriggerCandidates);
        next.add(new DndTriggerCandidate(candidateId, reason, correlationId, now));
        return withStatus(status, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, next, attributes, "BOOKING_DND_TRIGGER_CANDIDATE_RECORDED");
    }

    public Booking movementStatusObserved(
            String containerId,
            String movementStatus,
            long sequenceNumber,
            String statusReason,
            String lastKnownLocationId,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        java.util.HashMap<String, String> nextAttributes = new java.util.HashMap<>(attributes);
        nextAttributes.put("movementContainerId", containerId);
        nextAttributes.put("movementStatus", movementStatus);
        nextAttributes.put("movementSequenceNumber", String.valueOf(sequenceNumber));
        nextAttributes.put("movementStatusReason", statusReason == null ? "" : statusReason);
        nextAttributes.put("movementLastKnownLocationId", lastKnownLocationId == null ? "" : lastKnownLocationId);
        return withStatus(status, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, nextAttributes, "BOOKING_MOVEMENT_STATUS_RECORDED");
    }

    public Booking dndPricingObserved(
            String dndPricingRef,
            int chargeableDays,
            Map<String, String> lineItems,
            String dndStatus,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        java.util.HashMap<String, String> nextAttributes = new java.util.HashMap<>(attributes);
        nextAttributes.put("dndPricingRef", dndPricingRef);
        nextAttributes.put("dndChargeableDays", String.valueOf(chargeableDays));
        nextAttributes.put("dndStatus", dndStatus);
        for (Map.Entry<String, String> entry : (lineItems == null ? Map.<String, String>of() : lineItems).entrySet()) {
            nextAttributes.put("dnd." + entry.getKey(), entry.getValue());
        }
        return withStatus(status, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, nextAttributes, "BOOKING_DND_PRICING_STORED");
    }

    private Booking withStatus(
            BookingStatus nextStatus,
            int nextRevision,
            String actorSubjectId,
            String correlationId,
            Instant now,
            PricingSnapshot nextPricingSnapshot,
            List<BookingException> nextExceptions,
            List<DndTriggerCandidate> nextDndTriggerCandidates,
            Map<String, String> nextAttributes,
            String eventType) {
        List<LifecycleEvent> nextEvents = new ArrayList<>(lifecycleEvents);
        nextEvents.add(event(eventType, nextStatus, nextRevision, actorSubjectId, correlationId, now));
        return new Booking(id, bookingNumber, nextRevision, nextStatus, customerId, originLocationId, destinationLocationId,
                equipmentType, nextPricingSnapshot, nextExceptions, nextDndTriggerCandidates, nextEvents, nextAttributes);
    }

    private Map<String, String> withAttribute(String key, String value) {
        java.util.HashMap<String, String> next = new java.util.HashMap<>(attributes);
        next.put(key, value);
        return Map.copyOf(next);
    }

    private void requireStatus(BookingStatus... allowed) {
        for (BookingStatus candidate : allowed) {
            if (status == candidate) {
                return;
            }
        }
        throw new IllegalStateException("booking status " + status + " does not allow this transition");
    }

    private static LifecycleEvent event(String eventType, BookingStatus status, int revision, String actorSubjectId, String correlationId, Instant now) {
        return new LifecycleEvent(eventType, status, revision, actorSubjectId, correlationId, now);
    }
}
