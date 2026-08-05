package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.ReferenceFieldResult;
import com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome;
import com.linercore.platform.booking.domain.model.ReferenceValidationOutcome;
import com.linercore.platform.booking.domain.model.ReferenceValidationSnapshot;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PricingInputTest {
    @Test
    void canonicalBodyUsesFixedContractOrderAndEqualDates() {
        PricingInput input = PricingInput.from(booking("2026-08-01"), 0);
        String json = new String(input.canonicalBytes(), StandardCharsets.UTF_8);

        assertTrue(json.startsWith("{\"bookingRef\":\"BKG-1\",\"tradeLane\":\"NA-EU\",\"pol\":\"NLRTM\""));
        assertTrue(json.contains("\"dates\":{\"effectiveDate\":\"2026-08-01\","
                + "\"requestedDepartureDate\":\"2026-08-01\"}"));
    }

    @Test
    void fingerprintIsStableLowercaseSha256() {
        PricingInput first = PricingInput.from(booking("2026-08-01"), 0);
        PricingInput second = PricingInput.from(booking("2026-08-01"), 0);

        assertEquals(first.fingerprint(), second.fingerprint());
        assertTrue(first.fingerprint().matches("[0-9a-f]{64}"));
    }

    @Test
    void providerKeyUsesImmutableBookingNumberAndSequence() {
        assertEquals("BKG-1:3", PricingInput.from(booking("2026-08-01"), 3).providerKey());
    }

    @Test
    void sequenceDoesNotChangeCommercialInputComparison() {
        PricingInput first = PricingInput.from(booking("2026-08-01"), 0);
        PricingInput retry = PricingInput.from(booking("2026-08-01"), 8);

        assertTrue(first.sameCommercialInput(retry));
        assertFalse(first.fingerprint().equals(retry.fingerprint()));
    }

    @Test
    void changedDepartureIsPricingAffecting() {
        assertFalse(PricingInput.from(booking("2026-08-01"), 0)
                .sameCommercialInput(PricingInput.from(booking("2026-08-02"), 0)));
    }

    @Test
    void validatedReferenceRecordIdsBecomePricingAuthorityIds() {
        Booking booking = booking("2026-08-01");
        ReferenceValidationSnapshot validation = new ReferenceValidationSnapshot(
                booking.revision(),
                booking.referenceFingerprint(),
                ReferenceValidationOutcome.VALID,
                List.of(
                        active("customerId", "PARTY_CUSTOMER", "party-1", "party-customer-1"),
                        active("routing[0].loadUnLocode", "LOCATION", "NLRTM", "location-nlrtm"),
                        active("routing[0].dischargeUnLocode", "LOCATION", "SGSIN", "location-sgsin"),
                        active("routing[0].voyageId", "VESSEL_VOYAGE", "voyage-1", "voyage-record-1"),
                        active("equipment[0].equipmentTypeCode", "EQUIPMENT_TYPE", "45G1", "equipment-type-45g1")),
                Instant.parse("2026-07-29T10:00:00Z"),
                "corr-1");
        Booking validated = booking.applyReferenceValidation(
                validation, "booking-user", Instant.parse("2026-07-29T10:00:00Z"));

        PricingInput input = PricingInput.from(validated, 0);

        assertEquals("location-nlrtm", input.pol());
        assertEquals("location-sgsin", input.pod());
        assertEquals("equipment-type-45g1", input.equipmentType());
        assertEquals("party-customer-1", input.partyId());
        assertEquals(2, input.teu());
    }

    @Test
    void attemptDefensivelyCopiesExactBody() {
        PricingInput input = PricingInput.from(booking("2026-08-01"), 0);
        byte[] body = input.canonicalBytes();
        PricingAttempt attempt =
                new PricingAttempt(booking("2026-08-01"), input, body, input.fingerprint(), input.providerKey(), "corr-1");
        body[0] = 0;

        assertArrayEquals(input.canonicalBytes(), attempt.canonicalBody());
        assertThrows(IllegalArgumentException.class,
                () -> PricingInput.from(booking(null), 0));
    }

    static Booking booking(String date) {
        Map<String, String> attributes = date == null
                ? Map.of("tradeLaneId", "NA-EU", "commodityCode", "GEN")
                : Map.of(
                        "tradeLaneId", "NA-EU",
                        "commodityCode", "GEN",
                        "requestedDepartureDate", date,
                        "pricingAmendmentSeq", "0");
        return Booking.draft(
                        new BookingId("booking-1"),
                        "BKG-1",
                        "party-1",
                        List.of(new RoutingLeg(1, "NLRTM", "SGSIN", "voyage-1")),
                        List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")),
                        "USD",
                        "FCL_DRY",
                        false,
                        false,
                        attributes,
                        "booking-user",
                        "corr-1",
                        Instant.parse("2026-07-29T10:00:00Z"))
                .validated("booking-user", "corr-1", Instant.parse("2026-07-29T10:00:00Z"));
    }

    private static ReferenceFieldResult active(
            String fieldPath, String referenceSet, String requestedValue, String recordId) {
        return new ReferenceFieldResult(
                fieldPath,
                referenceSet,
                requestedValue,
                ReferenceValidationFieldOutcome.ACTIVE,
                recordId,
                requestedValue,
                1L,
                "ACTIVE");
    }
}
