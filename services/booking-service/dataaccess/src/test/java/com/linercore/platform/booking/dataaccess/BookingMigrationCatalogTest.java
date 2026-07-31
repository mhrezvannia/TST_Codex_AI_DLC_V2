package com.linercore.platform.booking.dataaccess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import org.junit.jupiter.api.Test;

class BookingMigrationCatalogTest {
    private static final String V1_SHA256 =
            "2b94af954745fc54c0323d1b6f950ca18b13b1b263d04e1f8d2e1040a3136443";
    private static final String V2_SHA256 =
            "5524fd5bb9ce3ac604c85c9496cc139b264040aefca603846b3e6030a15cc134";
    private static final String V3_SHA256 =
            "4b333a0287266211239317761247a9c9feb8ea462d241d22e0e04e41789604c7";

    @Test
    void preservesV1Checksum() throws Exception {
        assertEquals(V1_SHA256, hash(raw("/db/migration/V1__booking_baseline.sql")));
    }

    @Test
    void preservesV2Checksum() throws Exception {
        assertEquals(V2_SHA256, hash(raw("/db/migration/V2__booking_w1.sql")));
    }

    @Test
    void freezesReviewedV3Checksum() throws Exception {
        assertEquals(V3_SHA256, hash(raw("/db/migration/V3__booking_pricing_snapshots.sql")));
    }

    @Test
    void catalogContainsExactlyV1ThroughV3() {
        assertTrue(resourceExists("/db/migration/V1__booking_baseline.sql"));
        assertTrue(resourceExists("/db/migration/V2__booking_w1.sql"));
        assertTrue(resourceExists("/db/migration/V3__booking_pricing_snapshots.sql"));
        assertFalse(resourceExists("/db/migration/V4__booking_pricing_snapshots.sql"));
    }

    @Test
    void v3OwnsOnlyThePreparedSnapshotAndReceiptSchema() throws Exception {
        String v3 = text("/db/migration/V3__booking_pricing_snapshots.sql");
        for (String token : List.of(
                "booking_pricing_snapshots",
                "VARCHAR(192)",
                "provider_key VARCHAR(160)",
                "idx_booking_pricing_snapshots_cursor",
                "idx_booking_price_due",
                "chk_booking_idempotency_price_shape")) {
            assertTrue(v3.contains(token), token);
        }
        assertFalse(v3.toUpperCase().contains("DROP TABLE"));
        assertFalse(v3.toUpperCase().contains("DELETE FROM"));
        assertFalse(v3.toUpperCase().contains("TRUNCATE"));
    }

    private boolean resourceExists(String path) {
        try (var stream = getClass().getResourceAsStream(path)) {
            return stream != null;
        } catch (Exception exception) {
            return false;
        }
    }

    private String text(String path) throws Exception {
        return new String(raw(path), StandardCharsets.UTF_8);
    }

    private byte[] raw(String path) throws Exception {
        try (var stream = getClass().getResourceAsStream(path)) {
            if (stream == null) {
                throw new IllegalStateException("resource not found: " + path);
            }
            return stream.readAllBytes();
        }
    }

    private static String hash(byte[] value) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
    }
}
