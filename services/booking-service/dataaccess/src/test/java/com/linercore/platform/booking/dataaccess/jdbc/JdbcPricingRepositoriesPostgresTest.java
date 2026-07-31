package com.linercore.platform.booking.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionDisposition;
import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class JdbcPricingRepositoriesPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("booking_u05_repositories");

    private JdbcTemplate jdbc;
    private JdbcPricingOperationReceiptRepository receipts;
    private JdbcPricingSnapshotRepository snapshots;

    @BeforeEach
    void prepare() {
        DriverManagerDataSource dataSource =
                new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("DROP SCHEMA public CASCADE");
        jdbc.execute("CREATE SCHEMA public");
        Flyway.configure().dataSource(dataSource).locations("classpath:db/migration").load().migrate();
        ObjectMapper mapper = mapper();
        receipts = new JdbcPricingOperationReceiptRepository(jdbc, mapper);
        snapshots = new JdbcPricingSnapshotRepository(jdbc, mapper);
        insertBooking(jdbc, 1);
    }

    @Test
    void claimUsesDatabaseLeaseAndReplaysLiveOwner() {
        var first = receipts.claim(claim("a".repeat(64), "owner-1"));
        var duplicate = receipts.claim(claim("a".repeat(64), "owner-2"));

        assertEquals(ClaimDisposition.CLAIMED, first.disposition());
        assertEquals(ClaimDisposition.IN_PROGRESS, duplicate.disposition());
        assertEquals(1, first.receipt().fenceToken());
        assertNotNull(first.receipt().leaseExpiresAt());
    }

    @Test
    void conflictingBodyUnderProviderKeyIsRejected() {
        receipts.claim(claim("a".repeat(64), "owner-1"));

        assertEquals(ClaimDisposition.CONFLICT,
                receipts.claim(claim("b".repeat(64), "owner-2")).disposition());
    }

    @Test
    void expiredOwnerIsTakenOverWithHigherFence() {
        receipts.claim(claim("a".repeat(64), "owner-1"));
        jdbc.update("""
                UPDATE booking_idempotency
                SET lease_expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second'
                WHERE idempotency_key = 'P|BKG-1:0'
                """);

        var takeover = receipts.claim(claim("a".repeat(64), "owner-2"));

        assertEquals(ClaimDisposition.CLAIMED, takeover.disposition());
        assertEquals(2, takeover.receipt().fenceToken());
        assertEquals("owner-2", takeover.receipt().ownerToken());
    }

    @Test
    void receiptFenceCasDoesNotPublishHistoryOutsideTransactionalCompletionService() {
        var claim = receipts.claim(claim("a".repeat(64), "owner-1"));
        PricingCommandResult response = priced("price-1", "a".repeat(64), 0, 1);
        var command = new CompletionCommand(
                "P|BKG-1:0", new BookingId("booking-1"), "owner-1", claim.receipt().fenceToken(),
                "booking-user", 1, 0, "a".repeat(64), response);

        assertEquals(CompletionDisposition.COMPLETED, receipts.complete(command).disposition());
        assertEquals(CompletionDisposition.REPLAY, receipts.complete(command).disposition());
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM booking_pricing_snapshots WHERE booking_id = 'booking-1'",
                Integer.class));
    }

    @Test
    void historyCursorIsStableAndBounded() {
        snapshots.append(new BookingId("booking-1"), PricingSnapshot.typed(
                priced("price-1", "a".repeat(64), 0, 1).typedSnapshot()));
        snapshots.append(new BookingId("booking-1"), PricingSnapshot.typed(
                priced("price-2", "b".repeat(64), 1, 1).typedSnapshot()));

        var first = snapshots.findHistory(new BookingId("booking-1"), null, 1);
        var second = snapshots.findHistory(new BookingId("booking-1"), first.nextCursor(), 1);

        assertEquals("price-2", first.current().pricingRequestId());
        assertTrue(first.prior().isEmpty());
        assertNotNull(first.nextCursor());
        assertEquals("price-1", second.current().pricingRequestId());
    }

    static ClaimCommand claim(String hash, String owner) {
        return new ClaimCommand(
                "P|BKG-1:0", new BookingId("booking-1"), "BKG-1:0", hash, owner,
                Duration.ofSeconds(15), 1, 0, "corr-1");
    }

    static PricingCommandResult priced(String requestId, String fingerprint, int sequence, int revision) {
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "20.00"),
                line("THC", "LOCAL", "LOCAL", "5.00"));
        BookingPricingSnapshot snapshot = new BookingPricingSnapshot(
                2, requestId, "BKG-1", sequence, revision, fingerprint, LocalDate.parse("2026-08-01"),
                "TARIFF", "tariff:NA-EU", null, lines, List.of(), new BigDecimal("125.00"), "USD",
                Instant.parse("2026-07-29T10:00:00Z").plusSeconds(sequence),
                "corr-1", Instant.parse("2026-07-29T10:00:01Z").plusSeconds(sequence));
        return new PricingCommandResult(
                BookingPricingOutcome.PRICED, requestId, sequence, fingerprint, snapshot, null, null, 0, "corr-1");
    }

    static void insertBooking(JdbcTemplate jdbc, int revision) {
        jdbc.update("""
                INSERT INTO booking_records (
                    booking_id, booking_number, status, revision, customer_id,
                    origin_location_id, destination_location_id, updated_at, snapshot, snapshot_version
                ) VALUES (
                    'booking-1', 'BKG-1', 'VALIDATED', ?, 'party-1',
                    'NLRTM', 'SGSIN', CURRENT_TIMESTAMP, '{}', 1
                )
                """, revision);
    }

    static ObjectMapper mapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    private static PricingLineSnapshot line(
            String code, String category, String rateCategory, String amount) {
        return new PricingLineSnapshot(code, category, rateCategory, "PER_CONTAINER", 1,
                new BigDecimal(amount), new BigDecimal(amount), "USD", "rate-" + code);
    }
}
