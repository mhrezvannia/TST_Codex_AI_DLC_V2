package com.linercore.platform.booking.domain.model;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record Booking(
        BookingId id,
        String bookingNumber,
        int revision,
        BookingStatus status,
        String customerId,
        List<RoutingLeg> routing,
        List<EquipmentAssignment> equipment,
        String currency,
        String cargoMode,
        boolean reefer,
        boolean dangerousGoods,
        boolean legacyIncomplete,
        ReferenceValidationSnapshot referenceValidationSnapshot,
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
        routing = List.copyOf(routing == null ? List.of() : routing);
        equipment = List.copyOf(equipment == null ? List.of() : equipment);
        if (!legacyIncomplete && routing.size() != 1) {
            throw new IllegalArgumentException("W1 requires exactly one routing leg");
        }
        if (!legacyIncomplete && equipment.size() != 1) {
            throw new IllegalArgumentException("W1 requires exactly one equipment assignment");
        }
        currency = required(currency, "currency");
        cargoMode = required(cargoMode, "cargo mode");
        if (!"USD".equals(currency) || !"FCL_DRY".equals(cargoMode) || reefer || dangerousGoods) {
            throw new IllegalArgumentException("W1 supports USD FCL dry non-reefer non-DG bookings only");
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
            List<RoutingLeg> routing,
            List<EquipmentAssignment> equipment,
            String currency,
            String cargoMode,
            boolean reefer,
            boolean dangerousGoods,
            Map<String, String> attributes,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        return new Booking(id, bookingNumber, 1, BookingStatus.DRAFT, customerId, routing, equipment,
                currency, cargoMode, reefer, dangerousGoods, false, null, null, List.of(), List.of(),
                List.of(event("BOOKING_DRAFT_CREATED", BookingStatus.DRAFT, 1, actorSubjectId, correlationId, now)),
                attributes);
    }

    public static Booking legacyIncomplete(
            BookingId id,
            String bookingNumber,
            int revision,
            BookingStatus status,
            String customerId,
            PricingSnapshot pricingSnapshot,
            List<BookingException> exceptions,
            List<DndTriggerCandidate> dndTriggerCandidates,
            List<LifecycleEvent> lifecycleEvents,
            Map<String, String> legacyAttributes) {
        return new Booking(id, bookingNumber, revision, status, customerId, List.of(), List.of(), "USD", "FCL_DRY",
                false, false, true, null, pricingSnapshot, exceptions, dndTriggerCandidates, lifecycleEvents,
                legacyAttributes);
    }

    public Booking validated(String actorSubjectId, String correlationId, Instant now) {
        if (legacyIncomplete) {
            throw new IllegalStateException("legacy booking requires route and equipment correction");
        }
        requireStatus(BookingStatus.DRAFT, BookingStatus.VALIDATION_BLOCKED, BookingStatus.EXCEPTION);
        return withStatus(BookingStatus.VALIDATED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_VALIDATED");
    }

    public Booking applyReferenceValidation(
            ReferenceValidationSnapshot snapshot,
            String actorSubjectId,
            Instant now) {
        if (legacyIncomplete) {
            throw new IllegalStateException("legacy booking requires route and equipment correction");
        }
        requireStatus(BookingStatus.DRAFT, BookingStatus.VALIDATION_BLOCKED, BookingStatus.VALIDATED);
        if (snapshot.bookingRevision() != revision || !referenceFingerprint().equals(snapshot.referenceFingerprint())) {
            throw new IllegalStateException("BOOKING_CHANGED");
        }
        List<String> expectedPaths = referenceValidationFieldPaths();
        List<String> actualPaths = snapshot.fieldResults().stream().map(ReferenceFieldResult::fieldPath).toList();
        if (actualPaths.size() != expectedPaths.size()
                || !new LinkedHashSet<>(actualPaths).equals(new LinkedHashSet<>(expectedPaths))) {
            throw new IllegalArgumentException("reference validation result is incomplete");
        }
        BookingStatus nextStatus = snapshot.outcome() == ReferenceValidationOutcome.VALID
                ? BookingStatus.VALIDATED
                : BookingStatus.VALIDATION_BLOCKED;
        if (status == nextStatus && snapshot.equivalentTo(referenceValidationSnapshot)) {
            return this;
        }
        String eventType = nextStatus == BookingStatus.VALIDATED
                ? "BOOKING_VALIDATED"
                : "BOOKING_VALIDATION_BLOCKED";
        List<LifecycleEvent> nextEvents = new ArrayList<>(lifecycleEvents);
        nextEvents.add(event(eventType, nextStatus, revision, actorSubjectId, snapshot.correlationId(), now));
        return new Booking(id, bookingNumber, revision, nextStatus, customerId, routing, equipment, currency,
                cargoMode, reefer, dangerousGoods, legacyIncomplete, snapshot, pricingSnapshot, exceptions,
                dndTriggerCandidates, nextEvents, attributes);
    }

    public String referenceFingerprint() {
        StringBuilder canonical = new StringBuilder(customerId);
        routing.forEach(leg -> canonical.append('|').append(leg.legSequence())
                .append('|').append(leg.loadUnLocode())
                .append('|').append(leg.dischargeUnLocode())
                .append('|').append(leg.voyageId()));
        equipment.forEach(assignment -> canonical.append('|').append(assignment.equipmentTypeCode())
                .append('|').append(assignment.quantity())
                .append('|').append(assignment.equipmentId()));
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(canonical.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public List<String> referenceValidationFieldPaths() {
        List<String> paths = new ArrayList<>();
        paths.add("customerId");
        for (int index = 0; index < routing.size(); index++) {
            paths.add("routing[" + index + "].loadUnLocode");
            paths.add("routing[" + index + "].dischargeUnLocode");
            paths.add("routing[" + index + "].voyageId");
        }
        for (int index = 0; index < equipment.size(); index++) {
            paths.add("equipment[" + index + "].equipmentTypeCode");
        }
        return List.copyOf(paths);
    }

    public Booking pricingPending(String pricingRequestId, String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.VALIDATED);
        return withStatus(BookingStatus.PRICING_PENDING, revision, actorSubjectId, correlationId, now, null,
                exceptions, dndTriggerCandidates, withAttribute("pricingRequestId", pricingRequestId), "BOOKING_PRICING_REQUESTED");
    }

    public Booking priced(PricingSnapshot snapshot, String actorSubjectId, Instant now) {
        requireStatus(BookingStatus.VALIDATED, BookingStatus.PRICING_PENDING, BookingStatus.MANUAL_PRICING);
        return withStatus(BookingStatus.PRICED, revision, actorSubjectId, snapshot.correlationId(), now, snapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_PRICING_STORED");
    }

    public Booking typedPriced(BookingPricingSnapshot snapshot, String actorSubjectId, Instant now) {
        if (!id.value().equals(snapshot.bookingRef()) && !bookingNumber.equals(snapshot.bookingRef())) {
            throw new IllegalArgumentException("pricing snapshot booking reference does not match Booking");
        }
        if (snapshot.bookingRevision() != revision
                || snapshot.amendmentSeq() != pricingAmendmentSeq()
                || (!pricingInputFingerprint().isBlank()
                        && !snapshot.inputFingerprint().equals(pricingInputFingerprint()))) {
            throw new IllegalStateException("BOOKING_CHANGED");
        }
        requireStatus(
                BookingStatus.VALIDATED,
                BookingStatus.PRICING_PENDING,
                BookingStatus.MANUAL_PRICING,
                BookingStatus.AMENDED);
        java.util.HashMap<String, String> nextAttributes = new java.util.HashMap<>(attributes);
        nextAttributes.put("pricingStatus", "PRICED");
        nextAttributes.put("pricingAmendmentSeq", Integer.toString(snapshot.amendmentSeq()));
        nextAttributes.put("pricingInputFingerprint", snapshot.inputFingerprint());
        nextAttributes.put("currentPricingRequestId", snapshot.pricingRequestId());
        nextAttributes.put("currentPriceAmendmentSeq", Integer.toString(snapshot.amendmentSeq()));
        nextAttributes.put("currentPriceInputFingerprint", snapshot.inputFingerprint());
        BookingStatus nextStatus = status == BookingStatus.AMENDED ? BookingStatus.AMENDED : BookingStatus.PRICED;
        return withStatus(nextStatus, revision, actorSubjectId, snapshot.correlationId(), now,
                PricingSnapshot.typed(snapshot), exceptions, dndTriggerCandidates, nextAttributes,
                "BOOKING_PRICING_STORED");
    }

    public Booking manualPricing(
            String pricingRequestId,
            String reasonCode,
            String reasonMessage,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        requireStatus(BookingStatus.VALIDATED, BookingStatus.MANUAL_PRICING);
        java.util.HashMap<String, String> nextAttributes = new java.util.HashMap<>(attributes);
        nextAttributes.put("manualPricingRequestId", pricingRequestId == null ? "" : pricingRequestId);
        nextAttributes.put("manualPricingReasonCode", reasonCode == null ? "" : reasonCode);
        nextAttributes.put("manualPricingReasonMessage", reasonMessage == null ? "" : reasonMessage);
        nextAttributes.put("manualPricingCorrelationId", correlationId == null ? "" : correlationId);
        return withStatus(BookingStatus.MANUAL_PRICING, revision, actorSubjectId, correlationId, now, null,
                exceptions, dndTriggerCandidates, nextAttributes, "BOOKING_MANUAL_PRICING_REQUIRED");
    }

    public Booking confirmed(String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.PRICED);
        if (!confirmationPricingEligible()) {
            throw new IllegalStateException("PRICING_REQUIRED");
        }
        return withStatus(BookingStatus.CONFIRMED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_CONFIRMED");
    }

    public Booking amended(Map<String, String> nextAttributes, String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.CONFIRMED, BookingStatus.RECONFIRMED);
        return withStatus(BookingStatus.AMENDED, revision + 1, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, nextAttributes, "BOOKING_AMENDED");
    }

    public Booking pricingInputsAmended(
            Map<String, String> nextAttributes,
            String nextPricingFingerprint,
            String requestedDepartureDate,
            String actorSubjectId,
            String correlationId,
            Instant now) {
        if (nextPricingFingerprint == null || !nextPricingFingerprint.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException("pricing input fingerprint must be lowercase SHA-256");
        }
        java.util.HashMap<String, String> merged = new java.util.HashMap<>(
                nextAttributes == null ? Map.of() : nextAttributes);
        boolean changed = !nextPricingFingerprint.equals(pricingInputFingerprint());
        merged.put("pricingInputFingerprint", nextPricingFingerprint);
        merged.put("pricingAmendmentSeq", Integer.toString(pricingAmendmentSeq() + (changed ? 1 : 0)));
        merged.put("requestedDepartureDate", required(requestedDepartureDate, "requested departure date"));
        if (changed && pricingSnapshot != null) {
            merged.put("pricingStatus", "REPRICE_REQUIRED");
        }
        if (status == BookingStatus.CONFIRMED || status == BookingStatus.RECONFIRMED) {
            return amended(merged, actorSubjectId, correlationId, now);
        }
        requireStatus(
                BookingStatus.DRAFT,
                BookingStatus.VALIDATED,
                BookingStatus.PRICED,
                BookingStatus.MANUAL_PRICING);
        BookingStatus nextStatus = changed && pricingSnapshot != null ? BookingStatus.VALIDATED : status;
        return withStatus(nextStatus, revision + 1, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, merged, "BOOKING_AMENDED");
    }

    public Booking reconfirmed(String actorSubjectId, String correlationId, Instant now) {
        requireStatus(BookingStatus.AMENDED);
        if (!confirmationPricingEligible()) {
            throw new IllegalStateException("PRICING_REQUIRED");
        }
        return withStatus(BookingStatus.RECONFIRMED, revision, actorSubjectId, correlationId, now, pricingSnapshot,
                exceptions, dndTriggerCandidates, attributes, "BOOKING_RECONFIRMED");
    }

    public int pricingAmendmentSeq() {
        String value = attributes.get("pricingAmendmentSeq");
        if (value == null || value.isBlank()) {
            return 0;
        }
        return Integer.parseInt(value);
    }

    public String pricingInputFingerprint() {
        return attributes.getOrDefault("pricingInputFingerprint", "");
    }

    public boolean confirmationPricingEligible() {
        if (pricingSnapshot == null) {
            return false;
        }
        if (pricingSnapshot.typed() == null) {
            return false;
        }
        return pricingSnapshot.confirmationEligible(pricingAmendmentSeq(), pricingInputFingerprint())
                && !"REPRICE_REQUIRED".equals(attributes.get("pricingStatus"));
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
        return new Booking(id, bookingNumber, nextRevision, nextStatus, customerId, routing, equipment, currency,
                cargoMode, reefer, dangerousGoods, legacyIncomplete, referenceValidationSnapshot,
                nextPricingSnapshot, nextExceptions,
                nextDndTriggerCandidates, nextEvents, nextAttributes);
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

    public String originLocationId() {
        return routing.isEmpty() ? attributes.getOrDefault("originLocationId", "") : routing.get(0).loadUnLocode();
    }

    public String destinationLocationId() {
        return routing.isEmpty() ? attributes.getOrDefault("destinationLocationId", "") : routing.get(0).dischargeUnLocode();
    }

    public String equipmentType() {
        return equipment.isEmpty() ? attributes.getOrDefault("equipmentType", "") : equipment.get(0).equipmentTypeCode();
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}
