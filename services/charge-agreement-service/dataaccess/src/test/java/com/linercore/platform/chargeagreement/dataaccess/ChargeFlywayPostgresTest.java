package com.linercore.platform.chargeagreement.dataaccess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class ChargeFlywayPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("charge_migrations");

    @BeforeEach
    void resetSchema() throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA public CASCADE");
            statement.execute("CREATE SCHEMA public");
        }
    }

    @Test
    void emptyDatabaseMigratesInOrderToV4AndValidatesOnRestart() throws Exception {
        Flyway flyway = flyway();
        assertEquals(4, flyway.migrate().migrationsExecuted);
        assertTrue(flyway.validateWithResult().validationSuccessful);
        assertEquals(0, flyway.migrate().migrationsExecuted);
        assertEquals(4, scalar("SELECT COUNT(*) FROM flyway_schema_history WHERE success"));
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_name = 'charge_rate_versions'
                """));
    }

    @Test
    void baselineRowsReceiveDeterministicV3AndV4Backfills() throws Exception {
        Flyway v1 = Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .target("1")
                .load();
        v1.migrate();
        execute("""
                INSERT INTO charge_agreements (
                    id, agreement_number, customer_id, trade_lane_id, commodity_id,
                    valid_from, valid_to, status, version, created_by, created_at, snapshot
                ) VALUES (
                    'agreement-1', 'AGR-1', 'customer-1', 'lane-1', 'commodity-1',
                    DATE '2026-01-01', DATE '2026-12-31', 'APPROVED', 7,
                    'legacy-user', TIMESTAMP '2026-01-01 00:00:00', '{"legacy":true}'
                )
                """);
        execute("""
                INSERT INTO manual_pricing_cases (
                    case_id, pricing_request_id, reason_code, correlation_id, opened_at, snapshot
                ) VALUES
                    ('case-1', 'request-1', 'NO_RATE', 'corr-1', TIMESTAMP '2026-01-01 00:00:00', '{}'),
                    ('case-2', 'request-1', 'NO_RATE', 'corr-2', TIMESTAMP '2026-01-02 00:00:00', '{}')
                """);

        assertEquals(3, flyway().migrate().migrationsExecuted);
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM charge_agreement_versions
                WHERE agreement_version_id = 'av-' || md5('agreement-1:7')
                  AND authority_model = 'LEGACY' AND w2_authority_eligible = FALSE
                """));
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM manual_pricing_cases
                WHERE case_id = 'case-1' AND dedupe_key LIKE 'manual:v1|%'
                """));
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM manual_pricing_cases
                WHERE case_id = 'case-2' AND dedupe_key = 'legacy:case-2'
                """));
    }

    private Flyway flyway() {
        return Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .validateOnMigrate(true)
                .load();
    }

    private Connection connection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private void execute(String sql) throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private int scalar(String sql) throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement();
                var result = statement.executeQuery(sql)) {
            result.next();
            return result.getInt(1);
        }
    }
}
