package com.linercore.platform.chargeagreement.dataaccess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import org.junit.jupiter.api.Test;

class ChargeMigrationCatalogTest {
    @Test
    void v1IsTheExactLegacyCatalogModuloLineEndings() throws Exception {
        byte[] legacy = resource("/db/charge-agreement-schema.sql").replace("\r\n", "\n")
                .getBytes(StandardCharsets.UTF_8);
        byte[] migration = resource("/db/migration/V1__charge_baseline.sql").replace("\r\n", "\n")
                .getBytes(StandardCharsets.UTF_8);
        assertEquals(hash(legacy), hash(migration));
    }

    @Test
    void immutableMigrationChainContainsPreparedDownstreamContracts() throws IOException {
        String v2 = resource("/db/migration/V2__versioned_rate_authority.sql");
        String v3 = resource("/db/migration/V3__versioned_agreement_authority.sql");
        String v4 = resource("/db/migration/V4__pricing_terminal_evidence.sql");

        for (String token : List.of("charge_rates", "charge_rate_versions", "charge_rate_activity",
                "uq_charge_rate_versions_one_draft", "idx_charge_rate_versions_approved_overlap")) {
            assertTrue(v2.contains(token), token);
        }
        for (String token : List.of("authority_model", "charge_agreement_versions",
                "charge_agreement_rate_links", "av-' || md5", "w2_authority_eligible")) {
            assertTrue(v3.contains(token), token);
        }
        for (String token : List.of("terminal_schema_version", "manual_case_id", "dedupe_key",
                "uq_manual_pricing_cases_dedupe", "terminal_pricing_request_id")) {
            assertTrue(v4.contains(token), token);
        }
    }

    private String resource(String path) throws IOException {
        try (var stream = getClass().getResourceAsStream(path)) {
            if (stream == null) {
                throw new IOException("resource not found: " + path);
            }
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String hash(byte[] value) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
    }
}
