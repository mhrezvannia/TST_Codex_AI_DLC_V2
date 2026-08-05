package com.linercore.platform.booking.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionDisposition;
import com.linercore.platform.booking.domain.model.BookingId;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class BookingPricingConcurrencyPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("booking_u05_concurrency");

    private JdbcTemplate jdbc;
    private JdbcPricingOperationReceiptRepository receipts;

    @BeforeEach
    void prepare() {
        DriverManagerDataSource dataSource =
                new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("DROP SCHEMA public CASCADE");
        jdbc.execute("CREATE SCHEMA public");
        Flyway.configure().dataSource(dataSource).locations("classpath:db/migration").load().migrate();
        receipts = new JdbcPricingOperationReceiptRepository(jdbc, JdbcPricingRepositoriesPostgresTest.mapper());
        JdbcPricingRepositoriesPostgresTest.insertBooking(jdbc, 1);
    }

    @Test
    void sameKeyAndBodyHasOneClaimWinner() throws Exception {
        List<ClaimDisposition> outcomes = runTogether(
                () -> receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-1")).disposition(),
                () -> receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-2")).disposition());

        assertEquals(1, outcomes.stream().filter(value -> value == ClaimDisposition.CLAIMED).count());
        assertEquals(1, outcomes.stream().filter(value -> value == ClaimDisposition.IN_PROGRESS).count());
    }

    @Test
    void sameKeyAndConflictingBodyNeverCreatesSecondOperation() {
        receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-1"));

        assertEquals(ClaimDisposition.CONFLICT,
                receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("b".repeat(64), "owner-2")).disposition());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM booking_idempotency WHERE idempotency_key = 'P|BKG-1:0'",
                Integer.class));
    }

    @Test
    void expiredOwnerTakeoverFencesStaleCompletion() {
        var first = receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-1"));
        jdbc.update("""
                UPDATE booking_idempotency
                SET lease_expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second'
                WHERE idempotency_key = 'P|BKG-1:0'
                """);
        var second = receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-2"));
        var stale = receipts.complete(new CompletionCommand(
                "P|BKG-1:0", new BookingId("booking-1"), "owner-1", first.receipt().fenceToken(),
                "booking-user", 1, 0, "a".repeat(64),
                JdbcPricingRepositoriesPostgresTest.priced("price-stale", "a".repeat(64), 0, 1)));

        assertEquals(CompletionDisposition.STALE_OWNER, stale.disposition());
        assertTrue(second.receipt().fenceToken() > first.receipt().fenceToken());
    }

    @Test
    void concurrentAmendmentRejectsCapturedCompletion() {
        var claim = receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "owner-1"));
        jdbc.update("UPDATE booking_records SET revision = 2 WHERE booking_id = 'booking-1'");

        var result = receipts.complete(new CompletionCommand(
                "P|BKG-1:0", new BookingId("booking-1"), "owner-1", claim.receipt().fenceToken(),
                "booking-user", 1, 0, "a".repeat(64),
                JdbcPricingRepositoriesPostgresTest.priced("price-stale", "a".repeat(64), 0, 1)));

        assertEquals(CompletionDisposition.BOOKING_CHANGED, result.disposition());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM booking_pricing_snapshots", Integer.class));
    }

    @Test
    void halfOpenProbeContentionAdmitsOneLocalOwner() throws Exception {
        List<ClaimDisposition> outcomes = runTogether(
                () -> receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "probe-1")).disposition(),
                () -> receipts.claim(JdbcPricingRepositoriesPostgresTest.claim("a".repeat(64), "probe-2")).disposition());

        assertEquals(1, outcomes.stream().filter(value -> value == ClaimDisposition.CLAIMED).count());
        assertEquals(1, outcomes.stream().filter(value -> value == ClaimDisposition.IN_PROGRESS).count());
    }

    private static <T> List<T> runTogether(Callable<T> first, Callable<T> second) throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            return List.of(executor.submit(first).get(), executor.submit(second).get());
        }
    }
}
