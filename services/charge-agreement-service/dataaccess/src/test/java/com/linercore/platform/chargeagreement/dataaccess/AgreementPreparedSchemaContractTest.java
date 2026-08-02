package com.linercore.platform.chargeagreement.dataaccess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Locks U03 to the U01-owned prepared schema without granting U03 migration
 * authorship. The relay assertion is deliberately negative: a safe TEXT to
 * JSON classifier requires an owner-approved forward migration.
 */
class AgreementPreparedSchemaContractTest {
    @Test
    void v5ProtectsApprovedCommercialAuthorityAndItsRateLinks() throws Exception {
        String v5 = resource("/db/migration/V5__immutable_approved_pricing_authority.sql");

        for (String token : List.of(
                "trg_charge_rate_versions_approved_immutable",
                "trg_charge_agreement_versions_approved_immutable",
                "trg_charge_agreement_rate_links_approved_immutable",
                "OLD.lifecycle = 'APPROVED'",
                "NEW.lifecycle NOT IN ('SUSPENDED', 'EXPIRED')",
                "NEW.snapshot IS DISTINCT FROM OLD.snapshot",
                "USING ERRCODE = '55000'")) {
            assertTrue(v5.contains(token), token);
        }
    }

    @Test
    void immutableV3ContainsTheAgreementAuthorityContract() throws Exception {
        String v3 = resource("/db/migration/V3__versioned_agreement_authority.sql");

        for (String token : List.of(
                "authority_model VARCHAR(16) NOT NULL DEFAULT 'LEGACY'",
                "ALTER COLUMN commodity_id DROP NOT NULL",
                "CREATE TABLE charge_agreement_versions",
                "CREATE TABLE charge_agreement_rate_links",
                "uq_cav_one_draft_per_agreement",
                "idx_cav_w2_authority",
                "ALTER TABLE charge_agreement_activity",
                "idx_caa_version_time",
                "'av-' || md5(id || ':' || version::text)",
                "w2_authority_eligible")) {
            assertTrue(v3.contains(token), token);
        }
    }

    @Test
    void preparedV3DoesNotPretendToProvideTheRelayJsonClassifier() throws Exception {
        String v3 = resource("/db/migration/V3__versioned_agreement_authority.sql");

        assertFalse(v3.contains("charge_try_jsonb"),
                "U03 must remain relay-blocked until the migration owner adds a safe classifier");
        assertFalse(v3.contains("CREATE FUNCTION"),
                "U03 cannot manufacture the missing helper in the immutable V3 migration");
    }

    @Test
    void postgres15CatalogAndLegacyBackfillMatchThePreparedContract() throws Exception {
        Assumptions.assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker is required for the PostgreSQL 15 prepared-schema proof");

        try (PostgreSQLContainer<?> postgres =
                new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("u03_prepared_schema")) {
            postgres.start();
            Flyway v1 = Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .target("1")
                    .load();
            v1.migrate();

            try (var connection = DriverManager.getConnection(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                    var statement = connection.createStatement()) {
                statement.execute("""
                        INSERT INTO charge_agreements (
                            id, agreement_number, customer_id, trade_lane_id, commodity_id,
                            valid_from, valid_to, status, version, created_by, created_at, snapshot
                        ) VALUES (
                            'legacy-u03', 'LEG-U03', 'customer-1', 'lane-1', 'commodity-1',
                            DATE '2026-01-01', DATE '2026-12-31', 'APPROVED', 9,
                            'legacy-user', TIMESTAMP '2026-01-01 00:00:00', '{"legacy":true}'
                        )
                        """);
            }

            Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .load()
                    .migrate();

            assertEquals(1, scalar(postgres, """
                    SELECT COUNT(*) FROM charge_agreements
                    WHERE id = 'legacy-u03' AND authority_model = 'LEGACY'
                    """));
            assertEquals(1, scalar(postgres, """
                    SELECT COUNT(*) FROM charge_agreement_versions
                    WHERE agreement_version_id = 'av-' || md5('legacy-u03:9')
                      AND agreement_id = 'legacy-u03'
                      AND version_no = 9
                      AND authority_model = 'LEGACY'
                      AND lifecycle = 'LEGACY'
                      AND w2_authority_eligible = FALSE
                      AND commodity_id = 'commodity-1'
                    """));
            assertEquals(1, scalar(postgres, """
                    SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_name = 'charge_agreements'
                      AND column_name = 'commodity_id'
                      AND is_nullable = 'YES'
                    """));
            assertEquals(5, scalar(postgres, """
                    SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_name = 'charge_agreement_activity'
                      AND column_name IN (
                        'activity_id', 'agreement_version_id', 'actor_subject_id',
                        'correlation_id', 'resulting_row_version'
                      )
                    """));
            assertEquals(3, scalar(postgres, """
                    SELECT COUNT(*) FROM pg_indexes
                    WHERE schemaname = 'public'
                      AND indexname IN (
                        'uq_cav_one_draft_per_agreement',
                        'idx_cav_w2_authority',
                        'idx_caa_version_time'
                      )
                    """));
        }
    }

    private static int scalar(PostgreSQLContainer<?> postgres, String sql) throws Exception {
        try (var connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                var statement = connection.createStatement();
                var result = statement.executeQuery(sql)) {
            result.next();
            return result.getInt(1);
        }
    }

    private String resource(String path) throws Exception {
        try (var stream = getClass().getResourceAsStream(path)) {
            if (stream == null) {
                throw new IllegalStateException("resource not found: " + path);
            }
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
