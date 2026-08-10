package com.linercore.platform.booking.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.time.Instant;
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
}
