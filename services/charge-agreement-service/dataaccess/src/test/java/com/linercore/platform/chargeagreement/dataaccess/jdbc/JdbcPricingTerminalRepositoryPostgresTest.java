package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.OwnedPricingCompletion;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingClaim;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingReceiptUnavailableException;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingTerminalReceipt;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class JdbcPricingTerminalRepositoryPostgresTest {
    private static final Duration LEASE = Duration.ofSeconds(10);
    private static final Instant TERMINAL_AT = Instant.parse("2026-07-28T09:30:00Z");
    private static final String HASH = "a".repeat(64);

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("charge_u04_receipts");

    private DriverManagerDataSource dataSource;
    private JdbcTemplate jdbc;
    private ObjectMapper mapper;

    @BeforeEach
    void migrateCleanSchema() throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA public CASCADE");
            statement.execute("CREATE SCHEMA public");
        }
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();
        dataSource = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(dataSource);
        mapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    void databaseTimeLeaseTakeoverAndOwnerTokenFenceRejectStaleCompletion() {
        JdbcPricingRequestRepository repository = repository();
        PricingClaim original = claim("BK-LEASE", 1, "owner-old");
        assertTrue(repository.insertClaim(original, LEASE));
        assertFalse(repository.insertClaim(original, LEASE));
        assertFalse(repository.takeOverExpiredClaim(original.idempotencyKey(), "owner-new", LEASE));

        jdbc.update("UPDATE pricing_requests SET lease_until = CURRENT_TIMESTAMP - INTERVAL '1 second'");
        assertTrue(repository.takeOverExpiredClaim(original.idempotencyKey(), "owner-new", LEASE));

        byte[] winnerBytes = "{\"code\":\"priced\"}".getBytes(StandardCharsets.UTF_8);
        assertFalse(repository.completeOwned(success(
                original.idempotencyKey(), "owner-old", original.bookingRef() + ":1", winnerBytes)).completed());
        assertTrue(repository.completeOwned(success(
                original.idempotencyKey(), "owner-new", original.bookingRef() + ":1", winnerBytes)).completed());

        var replay = repository.findReceiptByIdempotencyKey(original.idempotencyKey()).orElseThrow();
        assertEquals("owner-new", replay.ownerToken());
        assertEquals(200, replay.terminal().httpStatus());
        assertEquals(PricingTerminalReceipt.PRICING_MEDIA_TYPE, replay.terminal().contentType());
        assertArrayEquals(winnerBytes, replay.terminal().responseSnapshot());
    }

    @Test
    void twentyTwoContextClaimRacesHaveExactlyOneWinner() throws Exception {
        for (int round = 0; round < 20; round++) {
            PricingClaim candidate = claim("BK-RACE-" + round, round, "owner-a-" + round);
            PricingClaim contender = new PricingClaim(
                    candidate.idempotencyKey(),
                    candidate.bookingRef(),
                    candidate.amendmentSeq(),
                    candidate.requestHash(),
                    "owner-b-" + round,
                    candidate.correlationId());
            CountDownLatch ready = new CountDownLatch(2);
            CountDownLatch start = new CountDownLatch(1);
            var executor = Executors.newFixedThreadPool(2);
            try {
                Future<Boolean> first = executor.submit(() -> raceInsert(repository(), candidate, ready, start));
                Future<Boolean> second = executor.submit(() -> raceInsert(repository(), contender, ready, start));
                ready.await();
                start.countDown();
                assertEquals(1, List.of(first.get(), second.get()).stream().filter(Boolean::booleanValue).count());
            } finally {
                executor.shutdownNow();
            }
        }
    }

    @Test
    void exactBytesReplayForPricedNoRateAndAmbiguityAndCasesConverge() {
        JdbcPricingRequestRepository repository = repository();
        List<Integer> statuses = List.of(200, 404, 422);
        List<String> reasons = List.of("PRICED", "NO_RATE", "AMBIGUOUS_BASE_RATE");
        List<byte[]> expectedBodies = new ArrayList<>();

        for (int index = 0; index < statuses.size(); index++) {
            String bookingRef = "BK-REPLAY-" + index;
            PricingClaim claim = claim(bookingRef, index, "owner-" + index);
            assertTrue(repository.insertClaim(claim, LEASE));
            byte[] body = ("{\"status\":" + statuses.get(index) + ",\"marker\":\""
                    + "é-" + index + "\"}").getBytes(StandardCharsets.UTF_8);
            expectedBodies.add(body);
            if (statuses.get(index) == 200) {
                assertTrue(repository.completeOwned(success(
                        claim.idempotencyKey(), claim.ownerToken(), bookingRef + ":" + index, body)).completed());
            } else {
                ManualPricingCase proposed = manualCase(
                        "case-" + index, bookingRef, index, reasons.get(index), HASH);
                assertTrue(repository.completeOwned(manual(
                        claim.idempotencyKey(), claim.ownerToken(), proposed, statuses.get(index), body))
                        .completed());
            }
        }

        for (int index = 0; index < statuses.size(); index++) {
            var receipt = repository.findReceiptByIdempotencyKey("BK-REPLAY-" + index + ":" + index)
                    .orElseThrow().terminal();
            assertEquals(statuses.get(index), receipt.httpStatus());
            assertArrayEquals(expectedBodies.get(index), receipt.responseSnapshot());
            assertEquals(statuses.get(index) == 200
                    ? PricingTerminalReceipt.PRICING_MEDIA_TYPE
                    : PricingTerminalReceipt.ERROR_MEDIA_TYPE, receipt.contentType());
        }
        assertEquals(2L, count("manual_pricing_cases"));
    }

    @Test
    void canonicalLegacyWinnerIsReusedUnchangedAndFailedCompletionRollsBackCase() {
        String pricingRequestId = "BK-LEGACY:4";
        String reason = "NO_RATE";
        String dedupe = ManualPricingCase.canonicalDedupeKey(pricingRequestId, reason);
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, correlation_id, opened_at,
                     snapshot, status, dedupe_key)
                VALUES ('legacy-winner', ?, ?, NULL, NULL, '{}', 'OPEN', ?)
                """, pricingRequestId, reason, dedupe);

        JdbcPricingRequestRepository repository = repository();
        PricingClaim legacyClaim = claim("BK-LEGACY", 4, "owner-legacy");
        assertTrue(repository.insertClaim(legacyClaim, LEASE));
        ManualPricingCase proposed = manualCase("new-case", "BK-LEGACY", 4, reason, HASH);
        PricingRequestRepository.CompletionResult completion = repository.completeOwned(new OwnedPricingCompletion(
                legacyClaim.idempotencyKey(),
                legacyClaim.ownerToken(),
                proposed,
                caseId -> terminal(
                        404,
                        pricingRequestId,
                        reason,
                        ("{\"manualCaseId\":\"" + caseId + "\"}").getBytes(StandardCharsets.UTF_8),
                        caseId)));

        assertTrue(completion.completed());
        assertEquals("legacy-winner", completion.receipt().manualCaseId());
        assertEquals(1L, count("manual_pricing_cases"));
        ManualPricingCase reused = new JdbcManualPricingCaseRepository(jdbc, mapper)
                .findOpenById("legacy-winner").orElseThrow();
        assertTrue(reused.legacyEvidence());
        assertEquals(null, reused.requestHash());

        PricingClaim failed = claim("BK-ROLLBACK", 5, "owner-rollback");
        assertTrue(repository.insertClaim(failed, LEASE));
        ManualPricingCase rollbackCase = manualCase("rollback-case", "BK-ROLLBACK", 5, reason, HASH);
        assertThrows(IllegalStateException.class, () -> repository.completeOwned(new OwnedPricingCompletion(
                failed.idempotencyKey(),
                failed.ownerToken(),
                rollbackCase,
                caseId -> {
                    throw new IllegalStateException("injected serialization failure");
                })));
        assertEquals(0L, jdbc.queryForObject(
                "SELECT COUNT(*) FROM manual_pricing_cases WHERE case_id = 'rollback-case'", Long.class));
        assertEquals("IN_PROGRESS", jdbc.queryForObject(
                "SELECT status FROM pricing_requests WHERE idempotency_key = ?", String.class,
                failed.idempotencyKey()));
    }

    @Test
    void incompletePreV4TerminalFailsClosed() {
        jdbc.update("""
                INSERT INTO pricing_requests
                    (idempotency_key, booking_ref, amendment_seq, request_hash, status,
                     owner_token, lease_until, response_snapshot, terminal_code,
                     correlation_id, started_at, completed_at)
                VALUES ('BK-OLD:1', 'BK-OLD', 1, ?, 'COMPLETED', 'old-owner',
                        CURRENT_TIMESTAMP, '{}', 'PRICED', 'corr-old',
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, HASH);

        assertThrows(PricingReceiptUnavailableException.class,
                () -> repository().findReceiptByIdempotencyKey("BK-OLD:1"));
    }

    @Test
    void concurrentCanonicalCaseCreationConvergesOnOneWinner() throws Exception {
        for (int round = 0; round < 20; round++) {
            String bookingRef = "BK-CASE-RACE-" + round;
            ManualPricingCase first = manualCase(
                    "case-a-" + round, bookingRef, round, "NO_RATE", HASH);
            ManualPricingCase second = manualCase(
                    "case-b-" + round, bookingRef, round, "NO_RATE", HASH);
            CountDownLatch ready = new CountDownLatch(2);
            CountDownLatch start = new CountDownLatch(1);
            var executor = Executors.newFixedThreadPool(2);
            try {
                Future<ManualPricingCase> firstResult = executor.submit(
                        () -> raceCaseCreate(manualRepository(), first, ready, start));
                Future<ManualPricingCase> secondResult = executor.submit(
                        () -> raceCaseCreate(manualRepository(), second, ready, start));
                ready.await();
                start.countDown();
                assertEquals(firstResult.get().caseId(), secondResult.get().caseId());
            } finally {
                executor.shutdownNow();
            }
        }
        assertEquals(20L, count("manual_pricing_cases"));
    }

    @Test
    void listAndDetailUseExactFiltersBoundedPagingAndNullLastOrdering() {
        JdbcManualPricingCaseRepository cases = manualRepository();
        cases.createOrGetOpen(manualCaseAt(
                "case-early", "BK-LIST", 1, "NO_RATE", HASH, TERMINAL_AT.minusSeconds(60)));
        cases.createOrGetOpen(manualCaseAt(
                "case-late", "BK-LIST", 2, "NO_RATE", HASH, TERMINAL_AT));
        cases.createOrGetOpen(manualCaseAt(
                "case-other", "BK-OTHER", 1, "AMBIGUOUS_LOCAL_RATE", "b".repeat(64),
                TERMINAL_AT.plusSeconds(60)));
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, correlation_id, opened_at,
                     snapshot, status, dedupe_key)
                VALUES ('case-legacy-null', 'legacy:1', 'NO_RATE', NULL, NULL,
                        '{}', 'OPEN', 'legacy:case-legacy-null')
                """);

        ManualPricingCaseRepository.ManualCasePage filtered = cases.listOpen(
                new ManualPricingCaseRepository.ManualCaseQuery(
                        "NO_RATE", "BK-LIST", null, null, 0, 2));
        assertEquals(2L, filtered.total());
        assertEquals(List.of("case-late", "case-early"),
                filtered.items().stream().map(ManualPricingCase::caseId).toList());

        ManualPricingCaseRepository.ManualCasePage all = cases.listOpen(
                new ManualPricingCaseRepository.ManualCaseQuery(null, null, null, null, 0, 100));
        assertEquals("case-legacy-null", all.items().getLast().caseId());
        assertTrue(all.items().getLast().legacyEvidence());
        ManualPricingCase detail = cases.findOpenById("case-late").orElseThrow();
        assertEquals(HASH, detail.requestHash());
        assertEquals("lane-1", detail.requestContext().tradeLane());
        assertFalse(detail.legacyEvidence());
        assertFalse(cases.findOpenById("missing-case").isPresent());
        assertThrows(IllegalArgumentException.class,
                () -> new ManualPricingCaseRepository.ManualCaseQuery(null, null, null, null, -1, 20));
        assertThrows(IllegalArgumentException.class,
                () -> new ManualPricingCaseRepository.ManualCaseQuery(null, null, null, null, 0, 101));
    }

    @Test
    void tenThousandOpenCasesKeepExactFiltersBoundedStablePagesAndSafeDetail() throws Exception {
        String context = mapper.writeValueAsString(
                manualCase("seed-case", "BK-SEED", 1, "NO_RATE", HASH).requestContext());
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, correlation_id, opened_at,
                     snapshot, status, booking_ref, amendment_seq, request_hash, dedupe_key)
                SELECT
                    'case-' || lpad(series::text, 5, '0'),
                    'BK-10000-' || (series % 10)::text || ':' || series::text,
                    CASE WHEN series % 2 = 0 THEN 'NO_RATE' ELSE 'AMBIGUOUS_LOCAL_RATE' END,
                    'corr-bounded',
                    TIMESTAMP '2026-07-01 00:00:00' + series * INTERVAL '1 second',
                    ?,
                    'OPEN',
                    'BK-10000-' || (series % 10)::text,
                    series,
                    ?,
                    'manual:test:' || series::text
                FROM generate_series(1, 9999) AS series
                """, context, HASH);
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, correlation_id, opened_at,
                     snapshot, status, dedupe_key)
                VALUES ('case-legacy-null', 'legacy:10000', 'NO_RATE', NULL, NULL,
                        '{}', 'OPEN', 'legacy:case-legacy-null')
                """);

        JdbcManualPricingCaseRepository cases = manualRepository();
        ManualPricingCaseRepository.ManualCaseQuery exactFilter =
                new ManualPricingCaseRepository.ManualCaseQuery(
                        "AMBIGUOUS_LOCAL_RATE", "BK-10000-7",
                        Instant.parse("2026-07-01T00:00:00Z"),
                        Instant.parse("2026-07-02T00:00:00Z"),
                        0, 100);
        ManualPricingCaseRepository.ManualCasePage first = cases.listOpen(exactFilter);
        ManualPricingCaseRepository.ManualCasePage second = cases.listOpen(
                new ManualPricingCaseRepository.ManualCaseQuery(
                        exactFilter.reasonCode(), exactFilter.bookingRef(),
                        exactFilter.openedFrom(), exactFilter.openedTo(), 1, 100));

        assertEquals(100, first.items().size());
        assertEquals(100, second.items().size());
        assertEquals(500L, first.total());
        assertTrue(first.items().stream().allMatch(item ->
                "AMBIGUOUS_LOCAL_RATE".equals(item.reasonCode())
                        && "BK-10000-7".equals(item.bookingRef())));
        assertTrue(first.items().getFirst().openedAt().isAfter(first.items().getLast().openedAt()));
        assertFalse(first.items().stream().map(ManualPricingCase::caseId).toList()
                .contains(second.items().getFirst().caseId()));

        ManualPricingCaseRepository.ManualCasePage last = cases.listOpen(
                new ManualPricingCaseRepository.ManualCaseQuery(null, null, null, null, 99, 100));
        assertEquals(100, last.items().size());
        assertEquals("case-legacy-null", last.items().getLast().caseId());
        assertTrue(last.items().getLast().legacyEvidence());

        ManualPricingCase detail = cases.findOpenById("case-09997").orElseThrow();
        assertEquals(HASH, detail.requestHash());
        assertEquals("lane-1", detail.requestContext().tradeLane());
        assertFalse(cases.findOpenById("case-10001").isPresent());

        List<String> columns = jdbc.queryForList("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'manual_pricing_cases'
                """, String.class);
        assertTrue(columns.stream().noneMatch(column -> List.of(
                        "amount", "unit_rate", "total", "assignment", "approval",
                        "resolution", "closed_at", "quote").contains(column)));
    }

    private JdbcPricingRequestRepository repository() {
        return new JdbcPricingRequestRepository(new JdbcTemplate(dataSource), mapper);
    }

    private JdbcManualPricingCaseRepository manualRepository() {
        return new JdbcManualPricingCaseRepository(new JdbcTemplate(dataSource), mapper);
    }

    private PricingClaim claim(String bookingRef, int amendmentSeq, String ownerToken) {
        return new PricingClaim(
                bookingRef + ":" + amendmentSeq,
                bookingRef,
                amendmentSeq,
                HASH,
                ownerToken,
                "corr-" + bookingRef);
    }

    private OwnedPricingCompletion success(
            String key,
            String ownerToken,
            String pricingRequestId,
            byte[] body) {
        return new OwnedPricingCompletion(
                key,
                ownerToken,
                null,
                ignored -> terminal(200, pricingRequestId, "PRICED", body, null));
    }

    private OwnedPricingCompletion manual(
            String key,
            String ownerToken,
            ManualPricingCase proposed,
            int status,
            byte[] body) {
        return new OwnedPricingCompletion(
                key,
                ownerToken,
                proposed,
                caseId -> terminal(status, proposed.pricingRequestId(), proposed.reasonCode(), body, caseId));
    }

    private PricingTerminalReceipt terminal(
            int status,
            String pricingRequestId,
            String reason,
            byte[] body,
            String caseId) {
        return new PricingTerminalReceipt(
                status,
                PricingTerminalReceipt.SCHEMA_VERSION,
                pricingRequestId,
                reason,
                body,
                "corr-terminal",
                TERMINAL_AT,
                caseId);
    }

    private ManualPricingCase manualCase(
            String caseId,
            String bookingRef,
            int amendmentSeq,
            String reason,
            String hash) {
        return manualCaseAt(caseId, bookingRef, amendmentSeq, reason, hash, TERMINAL_AT);
    }

    private ManualPricingCase manualCaseAt(
            String caseId,
            String bookingRef,
            int amendmentSeq,
            String reason,
            String hash,
            Instant openedAt) {
        LocalDate date = LocalDate.parse("2026-08-01");
        PricingRequest request = new PricingRequest(
                bookingRef, "lane-1", "USNYC", "NLRTM", "22G1", "party-1", "commodity-1",
                false, false, new PricingRequest.PricingDates(date, date),
                new PricingRequest.PricingQuantities(1, 2, amendmentSeq), "corr-terminal");
        return ManualPricingCase.open(caseId, request, reason, hash, openedAt);
    }

    private boolean raceInsert(
            JdbcPricingRequestRepository repository,
            PricingClaim claim,
            CountDownLatch ready,
            CountDownLatch start) throws Exception {
        ready.countDown();
        start.await();
        return repository.insertClaim(claim, LEASE);
    }

    private ManualPricingCase raceCaseCreate(
            JdbcManualPricingCaseRepository repository,
            ManualPricingCase proposed,
            CountDownLatch ready,
            CountDownLatch start) throws Exception {
        ready.countDown();
        start.await();
        return repository.createOrGetOpen(proposed);
    }

    private long count(String table) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
    }

    private Connection connection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }
}
