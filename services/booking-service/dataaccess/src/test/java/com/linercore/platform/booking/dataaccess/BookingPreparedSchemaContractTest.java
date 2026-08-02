package com.linercore.platform.booking.dataaccess;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;

class BookingPreparedSchemaContractTest {
    @Test
    void v4MakesPersistedPricingSnapshotsAppendOnly() throws Exception {
        String v4 = resource("/db/migration/V4__immutable_booking_pricing_snapshots.sql");
        for (String token : List.of(
                "protect_booking_pricing_snapshot",
                "BEFORE UPDATE OR DELETE",
                "trg_booking_pricing_snapshots_immutable",
                "USING ERRCODE = '55000'")) {
            assertTrue(v4.contains(token), token);
        }
    }

    @Test
    void v3DefinesTheImmutableSnapshotContract() throws Exception {
        String v3 = resource();
        for (String token : List.of(
                "CONSTRAINT pk_booking_pricing_snapshots",
                "CONSTRAINT fk_booking_pricing_snapshots_booking",
                "ON DELETE RESTRICT",
                "CHECK (amendment_seq >= 0)",
                "CHECK (booking_revision >= 0)",
                "CHECK (schema_version >= 2)")) {
            assertTrue(v3.contains(token), token);
        }
    }

    @Test
    void v3DefinesTheFinalCursorAndNoPreparedTwoColumnIndex() throws Exception {
        String v3 = resource();
        assertTrue(v3.contains("amendment_seq DESC"));
        assertTrue(v3.contains("created_at DESC"));
        assertTrue(v3.contains("pricing_request_id DESC"));
        assertFalse(v3.contains("idx_booking_pricing_snapshots_amendment"));
    }

    @Test
    void priceReceiptStatesHaveDisjointShapes() throws Exception {
        String v3 = resource();
        for (String token : List.of(
                "state = 'IN_PROGRESS'",
                "state = 'COMPLETED'",
                "state = 'RETRYABLE'",
                "response_http_status BETWEEN 100 AND 599",
                "retry_after_seconds BETWEEN 1 AND 30",
                "request_hash ~ '^[0-9a-f]{64}$'")) {
            assertTrue(v3.contains(token), token);
        }
    }

    @Test
    void priceReceiptContainsTheReviewedClaimFenceAndDueColumns() throws Exception {
        String v3 = resource();
        for (String token : List.of(
                "provider_key VARCHAR(160)",
                "response_http_status INTEGER",
                "response_snapshot TEXT",
                "lease_owner VARCHAR(128)",
                "lease_expires_at TIMESTAMP",
                "fence_token BIGINT NOT NULL DEFAULT 0",
                "attempt_count INTEGER NOT NULL DEFAULT 0",
                "next_attempt_at TIMESTAMP")) {
            assertTrue(v3.contains(token), token);
        }
    }

    @Test
    void migrationHasNoLegacyBackfillOrSnapshotMutation() throws Exception {
        String upper = resource().toUpperCase();
        assertFalse(upper.contains("UPDATE BOOKING_RECORDS"));
        assertFalse(upper.contains("UPDATE BOOKING_PRICING_SNAPSHOTS"));
        assertFalse(upper.contains("DELETE FROM"));
    }

    private String resource() throws Exception {
        return resource("/db/migration/V3__booking_pricing_snapshots.sql");
    }

    private String resource(String path) throws Exception {
        try (var stream = getClass().getResourceAsStream(path)) {
            if (stream == null) {
                throw new IllegalStateException("migration not found: " + path);
            }
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
