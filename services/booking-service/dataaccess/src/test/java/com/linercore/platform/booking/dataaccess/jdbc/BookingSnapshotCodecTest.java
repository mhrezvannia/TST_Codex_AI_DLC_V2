package com.linercore.platform.booking.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BookingSnapshotCodecTest {
    private final BookingSnapshotCodec codec = new BookingSnapshotCodec(
            new ObjectMapper().registerModule(new JavaTimeModule()));

    @Test
    void roundTripsCanonicalSnapshot() {
        Booking booking = Booking.draft(new BookingId("booking-1"), "BKG-1", "customer-1",
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")), "USD", "FCL_DRY", false, false,
                Map.of("commodityCode", "GENERAL"), "booking-user", "corr-1", Instant.parse("2026-07-01T00:00:00Z"));

        Booking restored = codec.read(codec.write(booking));

        assertEquals(booking, restored);
    }

    @Test
    void readsFlatLegacySnapshotWithoutInventingIdentity() {
        Booking restored = codec.read("""
                {"id":{"value":"legacy-1"},"bookingNumber":"BKG-LEGACY","revision":1,"status":"DRAFT",
                 "customerId":"customer-1","originLocationId":"legacy-origin","destinationLocationId":"legacy-destination",
                 "equipmentType":"40HC","pricingSnapshot":null,"exceptions":[],"dndTriggerCandidates":[],
                 "lifecycleEvents":[],"attributes":{"unknown":"preserved"}}
                """);

        assertTrue(restored.legacyIncomplete());
        assertTrue(restored.routing().isEmpty());
        assertTrue(restored.equipment().isEmpty());
        assertEquals("legacy-origin", restored.attributes().get("originLocationId"));
        assertEquals("preserved", restored.attributes().get("unknown"));
    }

    @Test
    void canonicalizesLegacySnapshotOnlyWhenAllIdentitiesAreValid() {
        Booking restored = codec.read("""
                {"id":{"value":"legacy-2"},"bookingNumber":"BKG-LEGACY-2","revision":2,"status":"DRAFT",
                 "customerId":"customer-2","originLocationId":"USNYC","destinationLocationId":"NLRTM",
                 "equipmentType":"45G1","pricingSnapshot":null,"exceptions":[],"dndTriggerCandidates":[],
                 "lifecycleEvents":[],"attributes":{"voyageId":"VOY-2","equipmentId":"MSCU6639870",
                 "unknown":"preserved"}}
                """);

        assertFalse(restored.legacyIncomplete());
        assertEquals("USNYC", restored.routing().get(0).loadUnLocode());
        assertEquals("VOY-2", restored.routing().get(0).voyageId());
        assertEquals("MSCU6639870", restored.equipment().get(0).equipmentId());
        assertEquals("preserved", restored.attributes().get("unknown"));
        assertFalse(restored.attributes().containsKey("originLocationId"));
    }

    @Test
    void roundTripsTypedSnapshotWithExactDecimalsAndVersions() {
        Booking typed = typedBooking();

        Booking restored = codec.read(codec.write(typed));

        assertEquals(0, new BigDecimal("125.50").compareTo(restored.pricingSnapshot().typed().total()));
        assertEquals("rate-OFR",
                restored.pricingSnapshot().typed().lines().get(0).sourceRateVersionId());
        assertEquals("2026-08-01", restored.pricingSnapshot().typed().requestedDepartureDate().toString());
    }

    @Test
    void oldFlattenedPricingDecodesAsDistinctLegacyEvidence() {
        Booking restored = codec.read("""
                {"id":{"value":"legacy-3"},"bookingNumber":"BKG-LEGACY-3","revision":1,"status":"PRICED",
                 "customerId":"customer-3","originLocationId":"legacy-origin","destinationLocationId":"legacy-destination",
                 "equipmentType":"40HC","pricingSnapshot":{"pricingRequestId":"request-1",
                 "pricingQuoteId":"quote-1","status":"QUOTED","quotedAmounts":{"total":"100.00 USD"},
                 "receivedAt":"2026-07-01T00:00:00Z","correlationId":"corr-1"},
                 "exceptions":[],"dndTriggerCandidates":[],"lifecycleEvents":[],"attributes":{}}
                """);

        assertEquals("100.00 USD", restored.pricingSnapshot().legacy().quotedAmounts().get("total"));
        assertEquals(null, restored.pricingSnapshot().typed());
    }

    @Test
    void rejectsPartialTypedEnrichmentInsteadOfFallingBackToLegacy() {
        String json = codec.write(typedBooking())
                .replace("\"sourceRateVersionId\":\"rate-OFR\"", "\"sourceRateVersionId\":null");

        assertThrows(IllegalStateException.class, () -> codec.read(json));
    }

    @Test
    void rejectsMixedTypedAndFlattenedEvidence() {
        String json = codec.write(typedBooking())
                .replace("\"quotedAmounts\":{}", "\"quotedAmounts\":{\"total\":\"125.50 USD\"}");

        assertThrows(IllegalStateException.class, () -> codec.read(json));
    }

    private static Booking typedBooking() {
        String fingerprint = "a".repeat(64);
        Booking booking = Booking.draft(
                        new BookingId("booking-typed"),
                        "BKG-TYPED",
                        "customer-1",
                        List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                        List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")),
                        "USD",
                        "FCL_DRY",
                        false,
                        false,
                        Map.of(
                                "commodityCode", "GENERAL",
                                "requestedDepartureDate", "2026-08-01",
                                "pricingAmendmentSeq", "0",
                                "pricingInputFingerprint", fingerprint),
                        "booking-user",
                        "corr-1",
                        Instant.parse("2026-07-01T00:00:00Z"))
                .validated("booking-user", "corr-1", Instant.parse("2026-07-01T00:00:00Z"));
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "20.25"),
                line("THC", "LOCAL", "LOCAL", "5.25"));
        BookingPricingSnapshot snapshot = new BookingPricingSnapshot(
                2, "price-typed", "BKG-TYPED", 0, 1, fingerprint, LocalDate.parse("2026-08-01"),
                "TARIFF", "tariff:NA-EU", null, lines, List.of("IMPORT_DND"), new BigDecimal("125.50"),
                "USD", Instant.parse("2026-07-01T00:00:01Z"), "corr-1",
                Instant.parse("2026-07-01T00:00:02Z"));
        return booking.typedPriced(snapshot, "pricing-service", Instant.parse("2026-07-01T00:00:02Z"));
    }

    private static PricingLineSnapshot line(String code, String category, String rateCategory, String amount) {
        return new PricingLineSnapshot(code, category, rateCategory, "PER_CONTAINER", 1,
                new BigDecimal(amount), new BigDecimal(amount), "USD", "rate-" + code);
    }
}
