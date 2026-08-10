package com.linercore.platform.booking.dataaccess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class BookingFlywayPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("booking_u05_migrations");

    @BeforeEach
    void resetSchema() throws Exception {
        execute("DROP SCHEMA public CASCADE");
        execute("CREATE SCHEMA public");
    }

    @Test
    void emptyDatabaseMigratesInOrderToV3AndRestartsCleanly() {
        Flyway flyway = flyway();
        assertEquals(3, flyway.migrate().migrationsExecuted);
        assertTrue(flyway.validateWithResult().validationSuccessful);
        assertEquals(0, flyway.migrate().migrationsExecuted);
        assertEquals(3, scalar("SELECT COUNT(*) FROM flyway_schema_history WHERE success"));
    }

    @Test
    void v2RowsAndLegacySnapshotSurviveV3() throws Exception {
        Flyway v2 = flyway("2");
        assertEquals(2, v2.migrate().migrationsExecuted);
        execute("""
                INSERT INTO booking_records (
                    booking_id, booking_number, status, revision, customer_id,
                    origin_location_id, destination_location_id, updated_at, snapshot, snapshot_version
                ) VALUES (
                    'booking-legacy', 'BOOKING-LEGACY', 'PRICED', 2, 'customer-1',
                    'NLRTM', 'SGSIN', CURRENT_TIMESTAMP,
                    '{"pricingSnapshot":{"quotedAmounts":{"total":"100.00 USD"}}}', 1
                )
                """);
        execute("""
                INSERT INTO booking_idempotency (
                    idempotency_key, booking_id, operation, request_hash, state, response_revision
                ) VALUES ('legacy-create', 'booking-legacy', 'CREATE', 'LEGACY_UNKNOWN', 'COMPLETED', 2)
                """);

        assertEquals(1, flyway().migrate().migrationsExecuted);
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM booking_records
                WHERE booking_id = 'booking-legacy'
                  AND snapshot = '{"pricingSnapshot":{"quotedAmounts":{"total":"100.00 USD"}}}'
                """));
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM booking_idempotency
                WHERE idempotency_key = 'legacy-create'
                  AND provider_key IS NULL AND fence_token = 0 AND attempt_count = 0
                """));
    }

    @Test
    void widenedKeyAndTypedSnapshotConstraintsAreEnforced() throws Exception {
        flyway().migrate();
        insertBooking("booking-u05", "BOOKING-U05");
        String key = "P|" + "b".repeat(160) + ":" + "1".repeat(29);
        assertEquals(192, key.length());
        execute("""
                INSERT INTO booking_idempotency (
                    idempotency_key, booking_id, operation, request_hash, state,
                    provider_key, correlation_id, lease_owner, lease_expires_at
                ) VALUES (
                    '%s', 'booking-u05', 'PRICE', '%s', 'IN_PROGRESS',
                    'BOOKING-U05:0', 'corr-u05', 'owner-u05', CURRENT_TIMESTAMP + INTERVAL '15 seconds'
                )
                """.formatted(key, "a".repeat(64)));

        assertThrows(SQLException.class, () -> execute("""
                INSERT INTO booking_pricing_snapshots (
                    booking_id, pricing_request_id, amendment_seq, booking_revision,
                    schema_version, snapshot, correlation_id
                ) VALUES ('booking-u05', 'request-invalid', -1, 0, 2, '{}', 'corr-u05')
                """));
    }

    @Test
    void duplicateSnapshotIdentityIsRejectedWithoutMutation() throws Exception {
        flyway().migrate();
        insertBooking("booking-u05", "BOOKING-U05");
        execute("""
                INSERT INTO booking_pricing_snapshots (
                    booking_id, pricing_request_id, amendment_seq, booking_revision,
                    schema_version, snapshot, correlation_id
                ) VALUES ('booking-u05', 'request-1', 0, 1, 2, '{"total":100.00}', 'corr-u05')
                """);

        assertThrows(SQLException.class, () -> execute("""
                INSERT INTO booking_pricing_snapshots (
                    booking_id, pricing_request_id, amendment_seq, booking_revision,
                    schema_version, snapshot, correlation_id
                ) VALUES ('booking-u05', 'request-1', 0, 1, 2, '{"total":200.00}', 'corr-other')
                """));
        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM booking_pricing_snapshots
                WHERE booking_id = 'booking-u05' AND pricing_request_id = 'request-1'
                  AND snapshot = '{"total":100.00}'
                """));
    }

    @Test
    void priceReceiptStateConstraintsRejectPartialShapes() throws Exception {
        flyway().migrate();
        insertBooking("booking-u05", "BOOKING-U05");
        assertThrows(SQLException.class, () -> execute("""
                INSERT INTO booking_idempotency (
                    idempotency_key, booking_id, operation, request_hash, state,
                    provider_key, correlation_id, lease_owner
                ) VALUES (
                    'P|BOOKING-U05:0', 'booking-u05', 'PRICE', '%s', 'IN_PROGRESS',
                    'BOOKING-U05:0', 'corr-u05', 'owner-without-expiry'
                )
                """.formatted("a".repeat(64))));
    }

    private Flyway flyway() {
        return Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .validateOnMigrate(true)
                .load();
    }

    private Flyway flyway(String target) {
        return Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .target(target)
                .load();
    }

    private void insertBooking(String id, String number) throws Exception {
        execute("""
                INSERT INTO booking_records (
                    booking_id, booking_number, status, revision, customer_id,
                    origin_location_id, destination_location_id, updated_at, snapshot, snapshot_version
                ) VALUES (
                    '%s', '%s', 'VALIDATED', 1, 'customer-1',
                    'NLRTM', 'SGSIN', CURRENT_TIMESTAMP, '{}', 1
                )
                """.formatted(id, number));
    }

    private void execute(String sql) throws Exception {
        try (Connection connection = DriverManager.getConnection(
                        POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private int scalar(String sql) {
        try (Connection connection = DriverManager.getConnection(
                        POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                Statement statement = connection.createStatement();
                var result = statement.executeQuery(sql)) {
            result.next();
            return result.getInt(1);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
