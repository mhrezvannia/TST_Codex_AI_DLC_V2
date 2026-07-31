package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.LegacyPricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.OwnedPricingCompletion;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingClaim;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingReceiptUnavailableException;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestStatus;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingTerminalReceipt;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredLegacyPricingRequest;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredPricingReceipt;
import com.linercore.platform.chargeagreement.domain.model.LegacyPricingOutcome;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

public class JdbcPricingRequestRepository
        implements PricingRequestRepository, LegacyPricingRequestRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;
    private final JdbcManualPricingCaseRepository manualCases;
    private final TransactionTemplate transactions;

    public JdbcPricingRequestRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
        this.manualCases = new JdbcManualPricingCaseRepository(jdbc, mapper);
        this.transactions = new TransactionTemplate(new DataSourceTransactionManager(
                Objects.requireNonNull(jdbc.getDataSource(), "JDBC data source is required")));
    }

    @Override
    public Optional<StoredPricingReceipt> findReceiptByIdempotencyKey(String idempotencyKey) {
        List<StoredPricingReceipt> rows = jdbc.query("""
                SELECT * FROM pricing_requests WHERE idempotency_key = ?
                """, (rs, rowNum) -> readReceipt(rs), idempotencyKey);
        return rows.stream().findFirst();
    }

    @Override
    public boolean insertClaim(PricingClaim claim, Duration leaseDuration) {
        long leaseMillis = validatedLeaseMillis(leaseDuration);
        try {
            int rows = jdbc.update("""
                    INSERT INTO pricing_requests
                        (idempotency_key, booking_ref, amendment_seq, request_hash, status,
                         owner_token, lease_until, correlation_id, started_at)
                    VALUES (?, ?, ?, ?, 'IN_PROGRESS', ?,
                            CURRENT_TIMESTAMP + (? * INTERVAL '1 millisecond'), ?,
                            CURRENT_TIMESTAMP)
                    """,
                    claim.idempotencyKey(),
                    claim.bookingRef(),
                    claim.amendmentSeq(),
                    claim.requestHash(),
                    claim.ownerToken(),
                    leaseMillis,
                    claim.correlationId());
            return rows == 1;
        } catch (DuplicateKeyException exception) {
            return false;
        }
    }

    @Override
    public boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Duration leaseDuration) {
        int rows = jdbc.update("""
                UPDATE pricing_requests
                   SET owner_token = ?,
                       lease_until = CURRENT_TIMESTAMP + (? * INTERVAL '1 millisecond')
                 WHERE idempotency_key = ?
                   AND status = 'IN_PROGRESS'
                   AND lease_until <= CURRENT_TIMESTAMP
                """,
                ownerToken,
                validatedLeaseMillis(leaseDuration),
                idempotencyKey);
        return rows == 1;
    }

    @Override
    public CompletionResult completeOwned(OwnedPricingCompletion completion) {
        try {
            return transactions.execute(status -> {
                ManualPricingCase canonicalCase = completion.proposedManualCase() == null
                        ? null
                        : manualCases.createOrGetOpen(completion.proposedManualCase());
                String caseId = canonicalCase == null ? null : canonicalCase.caseId();
                PricingTerminalReceipt terminal = completion.terminalFactory().create(caseId);
                validateCompletionCase(terminal, canonicalCase);
                int rows = jdbc.update("""
                        UPDATE pricing_requests
                           SET status = ?,
                               response_snapshot = ?,
                               terminal_code = ?,
                               correlation_id = ?,
                               completed_at = ?,
                               terminal_http_status = ?,
                               terminal_schema_version = ?,
                               terminal_pricing_request_id = ?,
                               manual_case_id = ?
                         WHERE idempotency_key = ?
                           AND owner_token = ?
                           AND status = 'IN_PROGRESS'
                        """,
                        terminal.httpStatus() == 200 ? PricingRequestStatus.COMPLETED.name()
                                : PricingRequestStatus.MANUAL.name(),
                        terminal.responseUtf8(),
                        terminal.terminalCode(),
                        terminal.correlationId(),
                        timestamp(terminal.completedAt()),
                        terminal.httpStatus(),
                        terminal.schemaVersion(),
                        terminal.pricingRequestId(),
                        terminal.manualCaseId(),
                        completion.idempotencyKey(),
                        completion.ownerToken());
                if (rows != 1) {
                    throw StaleOwnerCompletion.INSTANCE;
                }
                return CompletionResult.completed(terminal);
            });
        } catch (StaleOwnerCompletion exception) {
            return CompletionResult.staleOwner();
        }
    }

    @Override
    public Optional<StoredLegacyPricingRequest> findByIdempotencyKey(String idempotencyKey) {
        List<StoredLegacyPricingRequest> rows = jdbc.query("""
                SELECT * FROM pricing_requests WHERE idempotency_key = ?
                """, (rs, rowNum) -> read(rs), idempotencyKey);
        return rows.stream().findFirst();
    }

    @Override
    public boolean insertClaim(StoredLegacyPricingRequest claim) {
        try {
            int rows = jdbc.update("""
                    INSERT INTO pricing_requests
                        (idempotency_key, booking_ref, amendment_seq, request_hash, status,
                         owner_token, lease_until, terminal_code, correlation_id, started_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    claim.idempotencyKey(),
                    claim.bookingRef(),
                    claim.amendmentSeq(),
                    claim.requestHash(),
                    claim.status().name(),
                    claim.ownerToken(),
                    timestamp(claim.leaseUntil()),
                    claim.terminalCode(),
                    claim.correlationId(),
                    timestamp(claim.startedAt()));
            return rows == 1;
        } catch (DuplicateKeyException exception) {
            return false;
        }
    }

    @Override
    public boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Instant leaseUntil, Instant now) {
        int rows = jdbc.update("""
                UPDATE pricing_requests
                   SET owner_token = ?,
                       lease_until = ?
                 WHERE idempotency_key = ?
                   AND status = ?
                   AND lease_until <= ?
                """,
                ownerToken,
                timestamp(leaseUntil),
                idempotencyKey,
                PricingRequestStatus.IN_PROGRESS.name(),
                timestamp(now));
        return rows == 1;
    }

    @Override
    public boolean completeOwned(
            String idempotencyKey,
            String ownerToken,
            LegacyPricingOutcome outcome,
            String terminalCode,
            Instant completedAt) {
        int rows = jdbc.update("""
                UPDATE pricing_requests
                   SET status = ?,
                       response_snapshot = ?,
                       terminal_code = ?,
                       completed_at = ?
                 WHERE idempotency_key = ?
                   AND owner_token = ?
                   AND status = ?
                """,
                outcome instanceof LegacyPricingOutcome.Manual
                        ? PricingRequestStatus.MANUAL.name()
                        : PricingRequestStatus.COMPLETED.name(),
                json.write(LegacyTerminalSnapshot.from(outcome)),
                terminalCode,
                timestamp(completedAt),
                idempotencyKey,
                ownerToken,
                PricingRequestStatus.IN_PROGRESS.name());
        return rows == 1;
    }

    private StoredLegacyPricingRequest read(ResultSet rs) throws SQLException {
        String snapshot = rs.getString("response_snapshot");
        return new StoredLegacyPricingRequest(
                rs.getString("idempotency_key"),
                rs.getString("booking_ref"),
                rs.getInt("amendment_seq"),
                rs.getString("request_hash"),
                PricingRequestStatus.valueOf(rs.getString("status")),
                rs.getString("owner_token"),
                instant(rs.getTimestamp("lease_until")),
                snapshot == null ? null : json.read(snapshot, LegacyTerminalSnapshot.class).toOutcome(),
                rs.getString("terminal_code"),
                rs.getString("correlation_id"),
                instant(rs.getTimestamp("started_at")),
                instant(rs.getTimestamp("completed_at")));
    }

    private StoredPricingReceipt readReceipt(ResultSet rs) throws SQLException {
        PricingRequestStatus status = PricingRequestStatus.valueOf(rs.getString("status"));
        PricingTerminalReceipt terminal = null;
        if (status != PricingRequestStatus.IN_PROGRESS) {
            try {
                Integer httpStatus = nullableInteger(rs, "terminal_http_status");
                String schema = rs.getString("terminal_schema_version");
                String pricingRequestId = rs.getString("terminal_pricing_request_id");
                String response = rs.getString("response_snapshot");
                String terminalCode = rs.getString("terminal_code");
                Instant completedAt = instant(rs.getTimestamp("completed_at"));
                if (httpStatus == null || schema == null || pricingRequestId == null
                        || response == null || terminalCode == null || completedAt == null) {
                    throw new PricingReceiptUnavailableException(
                            "legacy terminal receipt lacks exact W2 replay evidence");
                }
                terminal = new PricingTerminalReceipt(
                        httpStatus,
                        schema,
                        pricingRequestId,
                        terminalCode,
                        response.getBytes(StandardCharsets.UTF_8),
                        rs.getString("correlation_id"),
                        completedAt,
                        rs.getString("manual_case_id"));
            } catch (IllegalArgumentException exception) {
                throw new PricingReceiptUnavailableException("terminal receipt evidence is malformed", exception);
            }
        }
        return new StoredPricingReceipt(
                rs.getString("idempotency_key"),
                rs.getString("booking_ref"),
                rs.getInt("amendment_seq"),
                rs.getString("request_hash"),
                status,
                rs.getString("owner_token"),
                instant(rs.getTimestamp("lease_until")),
                rs.getString("correlation_id"),
                instant(rs.getTimestamp("started_at")),
                terminal);
    }

    private static Integer nullableInteger(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }

    private static long validatedLeaseMillis(Duration leaseDuration) {
        long millis = Objects.requireNonNull(leaseDuration, "lease duration is required").toMillis();
        if (millis < 1 || millis > Duration.ofMinutes(5).toMillis()) {
            throw new IllegalArgumentException("lease duration is out of bounds");
        }
        return millis;
    }

    private static void validateCompletionCase(
            PricingTerminalReceipt terminal,
            ManualPricingCase canonicalCase) {
        if (canonicalCase == null && terminal.manualCaseId() != null) {
            throw new IllegalArgumentException("priced completion cannot reference a manual case");
        }
        if (canonicalCase != null) {
            if (!canonicalCase.caseId().equals(terminal.manualCaseId())
                    || !canonicalCase.pricingRequestId().equals(terminal.pricingRequestId())
                    || !canonicalCase.reasonCode().equals(terminal.terminalCode())) {
                throw new IllegalArgumentException("manual case and terminal evidence do not match");
            }
        }
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private record LegacyTerminalSnapshot(
            String kind,
            PricingResult result,
            String pricingRequestId,
            String reasonCode,
            String correlationId) {
        private static LegacyTerminalSnapshot from(LegacyPricingOutcome outcome) {
            if (outcome instanceof LegacyPricingOutcome.Automatic automatic) {
                return new LegacyTerminalSnapshot("AUTOMATIC", automatic.result(), null, null, null);
            }
            LegacyPricingOutcome.Manual manual = (LegacyPricingOutcome.Manual) outcome;
            return new LegacyTerminalSnapshot(
                    "MANUAL", null, manual.pricingRequestId(), manual.reasonCode(), manual.correlationId());
        }

        private LegacyPricingOutcome toOutcome() {
            if ("AUTOMATIC".equals(kind) && result != null) {
                return new LegacyPricingOutcome.Automatic(result);
            }
            if ("MANUAL".equals(kind)) {
                return new LegacyPricingOutcome.Manual(pricingRequestId, reasonCode, correlationId);
            }
            throw new PricingReceiptUnavailableException("legacy pricing terminal outcome is malformed");
        }
    }

    private static final class StaleOwnerCompletion extends RuntimeException {
        private static final StaleOwnerCompletion INSTANCE = new StaleOwnerCompletion();

        private StaleOwnerCompletion() {
            super(null, null, false, false);
        }
    }
}
