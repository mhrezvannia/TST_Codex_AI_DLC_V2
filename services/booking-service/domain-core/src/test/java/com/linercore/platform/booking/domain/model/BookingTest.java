package com.linercore.platform.booking.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertSame;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BookingTest {
    private final Instant now = Instant.parse("2026-07-01T00:00:00Z");

    @Test
    void confirmsBookingOnlyAfterValidationAndPricingSnapshot() {
        Booking booking = draft()
                .validated("booking-user", "corr-1", now)
                .pricingPending("price-req-1", "booking-user", "corr-1", now)
                .priced(new PricingSnapshot("price-req-1", "quote-1", "QUOTED", Map.of("total", "100.00 USD"), now, "corr-1"),
                        "pricing-service", now)
                .confirmed("booking-user", "corr-1", now);

        assertEquals(BookingStatus.CONFIRMED, booking.status());
        assertEquals("100.00 USD", booking.pricingSnapshot().quotedAmounts().get("total"));
        assertEquals(5, booking.lifecycleEvents().size());
    }

    @Test
    void rejectsConfirmationWithoutPricing() {
        Booking booking = draft().validated("booking-user", "corr-1", now);

        assertThrows(IllegalStateException.class, () -> booking.confirmed("booking-user", "corr-1", now));
    }

    @Test
    void amendsAndReconfirmsWithoutCalculatingPricing() {
        Booking confirmed = draft()
                .validated("booking-user", "corr-1", now)
                .pricingPending("price-req-1", "booking-user", "corr-1", now)
                .priced(new PricingSnapshot("price-req-1", "quote-1", "QUOTED", Map.of("total", "100.00 USD"), now, "corr-1"),
                        "pricing-service", now)
                .confirmed("booking-user", "corr-1", now);

        Booking reconfirmed = confirmed
                .amended(Map.of("specialInstructions", "reefer plug required"), "booking-user", "corr-2", now)
                .reconfirmed("booking-user", "corr-2", now);

        assertEquals(BookingStatus.RECONFIRMED, reconfirmed.status());
        assertEquals(2, reconfirmed.revision());
        assertEquals("quote-1", reconfirmed.pricingSnapshot().pricingQuoteId());
    }

    @Test
    void recordsExceptionsAndDndTriggerCandidatesAsBookingEvidenceOnly() {
        Booking booking = draft()
                .exception("REFERENCE_VALIDATION_FAILED", "origin is inactive", "booking-user", "corr-3", now)
                .dndTriggerCandidate("dnd-candidate-1", "confirmed import booking", "booking-user", "corr-4", now);

        assertEquals(BookingStatus.EXCEPTION, booking.status());
        assertEquals(1, booking.exceptions().size());
        assertEquals(1, booking.dndTriggerCandidates().size());
    }

    @Test
    void normalizesCanonicalRouteAndEquipment() {
        Booking booking = Booking.draft(new BookingId("booking-2"), "BKG-0002", "customer-1",
                List.of(new RoutingLeg(1, "usnyc", "nlrtm", "voyage-1")),
                List.of(new EquipmentAssignment("45g1", 1, "mscu6639870")),
                "USD", "FCL_DRY", false, false, Map.of(), "booking-user", "corr-1", now);

        assertEquals("USNYC", booking.routing().get(0).loadUnLocode());
        assertEquals("45G1", booking.equipment().get(0).equipmentTypeCode());
        assertEquals("MSCU6639870", booking.equipment().get(0).equipmentId());
    }

    @Test
    void rejectsInvalidIso6346EquipmentId() {
        assertThrows(IllegalArgumentException.class,
                () -> new EquipmentAssignment("45G1", 1, "MSCU6639872"));
    }

    @Test
    void rejectsEqualLoadAndDischarge() {
        assertThrows(IllegalArgumentException.class,
                () -> new RoutingLeg(1, "USNYC", "USNYC", "voyage-1"));
    }

    @Test
    void legacyIncompleteCannotValidate() {
        Booking legacy = Booking.legacyIncomplete(new BookingId("legacy-1"), "BKG-LEGACY", 1,
                BookingStatus.DRAFT, "customer-1", null, java.util.List.of(), java.util.List.of(),
                java.util.List.of(), Map.of("originLocationId", "legacy-origin"));

        assertThrows(IllegalStateException.class, () -> legacy.validated("booking-user", "corr-1", now));
    }

    @Test
    void blockedValidationPersistsAllFieldsAndValidRetryReplacesIt() {
        Booking draft = draft();
        List<ReferenceFieldResult> blockedFields = validationFields(draft, ReferenceValidationFieldOutcome.ACTIVE);
        blockedFields.set(2, new ReferenceFieldResult("routing[0].dischargeUnLocode", "LOCATION", "NLRTM",
                ReferenceValidationFieldOutcome.INACTIVE, "location-nlrot", "NLRTM", 2L, "REFERENCE_INACTIVE"));
        Booking blocked = draft.applyReferenceValidation(new ReferenceValidationSnapshot(1,
                draft.referenceFingerprint(), ReferenceValidationOutcome.BLOCKED, blockedFields, now, "corr-blocked"),
                "booking-user", now);

        Booking valid = blocked.applyReferenceValidation(new ReferenceValidationSnapshot(1,
                blocked.referenceFingerprint(), ReferenceValidationOutcome.VALID,
                validationFields(blocked, ReferenceValidationFieldOutcome.ACTIVE), now.plusSeconds(1), "corr-valid"),
                "booking-user", now.plusSeconds(1));

        assertEquals(BookingStatus.VALIDATION_BLOCKED, blocked.status());
        assertEquals(5, blocked.referenceValidationSnapshot().fieldResults().size());
        assertEquals(BookingStatus.VALIDATED, valid.status());
        assertEquals(ReferenceValidationOutcome.VALID, valid.referenceValidationSnapshot().outcome());
        assertEquals("BOOKING_VALIDATED", valid.lifecycleEvents().get(valid.lifecycleEvents().size() - 1).eventType());
    }

    @Test
    void equivalentValidationIsIdempotentAndStaleFingerprintIsRejected() {
        Booking draft = draft();
        ReferenceValidationSnapshot snapshot = new ReferenceValidationSnapshot(1, draft.referenceFingerprint(),
                ReferenceValidationOutcome.VALID, validationFields(draft, ReferenceValidationFieldOutcome.ACTIVE),
                now, "corr-valid");
        Booking valid = draft.applyReferenceValidation(snapshot, "booking-user", now);

        assertSame(valid, valid.applyReferenceValidation(snapshot, "booking-user", now.plusSeconds(1)));
        assertThrows(IllegalStateException.class, () -> draft.applyReferenceValidation(
                new ReferenceValidationSnapshot(1, "stale-fingerprint", ReferenceValidationOutcome.VALID,
                        validationFields(draft, ReferenceValidationFieldOutcome.ACTIVE), now, "corr-stale"),
                "booking-user", now));
    }

    private List<ReferenceFieldResult> validationFields(
            Booking booking,
            ReferenceValidationFieldOutcome outcome) {
        return new java.util.ArrayList<>(List.of(
                field("customerId", "PARTY_CUSTOMER", booking.customerId(), outcome),
                field("routing[0].loadUnLocode", "LOCATION", booking.routing().get(0).loadUnLocode(), outcome),
                field("routing[0].dischargeUnLocode", "LOCATION", booking.routing().get(0).dischargeUnLocode(), outcome),
                field("routing[0].voyageId", "VESSEL_VOYAGE", booking.routing().get(0).voyageId(), outcome),
                field("equipment[0].equipmentTypeCode", "EQUIPMENT_TYPE",
                        booking.equipment().get(0).equipmentTypeCode(), outcome)));
    }

    private ReferenceFieldResult field(
            String path,
            String set,
            String value,
            ReferenceValidationFieldOutcome outcome) {
        return new ReferenceFieldResult(path, set, value, outcome, value, value, 1L,
                outcome == ReferenceValidationFieldOutcome.ACTIVE ? "REFERENCE_ACTIVE" : "REFERENCE_INVALID");
    }

    private Booking draft() {
        return Booking.draft(new BookingId("booking-1"), "BKG-0001", "customer-1",
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")),
                "USD", "FCL_DRY", false, false, Map.of(), "booking-user", "corr-1", now);
    }
}
