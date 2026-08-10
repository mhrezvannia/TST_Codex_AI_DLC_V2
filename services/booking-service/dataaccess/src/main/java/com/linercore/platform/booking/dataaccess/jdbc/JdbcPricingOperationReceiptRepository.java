package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

public class JdbcPricingOperationReceiptRepository implements PricingOperationReceiptPort {
    private final JdbcTemplate jdbc;
    private final PricingCommandReceiptCodec codec;

    public JdbcPricingOperationReceiptRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.codec = new PricingCommandReceiptCodec(mapper);
    }

    @Override
    @Transactional
    public ClaimResult claim(ClaimCommand command) {
        List<ReceiptWithDbTime> rows = jdbc.query("""
                SELECT idempotency_key, booking_id, provider_key, request_hash, state,
                       lease_owner, lease_expires_at, fence_token, attempt_count,
                       next_attempt_at, response_snapshot, correlation_id,
                       CURRENT_TIMESTAMP AS db_now
                FROM booking_idempotency
                WHERE idempotency_key = ?
                FOR UPDATE
                """, this::receiptWithTime, command.receiptKey());
        if (rows.isEmpty()) {
            return insertClaim(command);
        }

        ReceiptWithDbTime stored = rows.get(0);
        if (!stored.receipt().inputHash().equals(command.inputHash())
                || !stored.receipt().providerKey().equals(command.providerKey())
                || !stored.receipt().bookingId().equals(command.bookingId())) {
            return new ClaimResult(ClaimDisposition.CONFLICT, stored.receipt());
        }
        if ("COMPLETED".equals(stored.receipt().state())) {
            return new ClaimResult(ClaimDisposition.REPLAY, stored.receipt());
        }
        if ("IN_PROGRESS".equals(stored.receipt().state())
                && stored.receipt().leaseExpiresAt() != null
                && stored.receipt().leaseExpiresAt().isAfter(stored.dbNow())) {
            return new ClaimResult(ClaimDisposition.IN_PROGRESS, stored.receipt());
        }
        if ("RETRYABLE".equals(stored.receipt().state())
                && stored.receipt().nextAttemptAt() != null
                && stored.receipt().nextAttemptAt().isAfter(stored.dbNow())) {
            return new ClaimResult(ClaimDisposition.REPLAY, stored.receipt());
        }

        jdbc.update("""
                UPDATE booking_idempotency
                SET state = 'IN_PROGRESS',
                    lease_owner = ?,
                    lease_expires_at = CURRENT_TIMESTAMP + (? * INTERVAL '1 second'),
                    fence_token = fence_token + 1,
                    attempt_count = attempt_count + 1,
                    response_http_status = NULL,
                    response_code = NULL,
                    response_snapshot = NULL,
                    retry_after_seconds = NULL,
                    next_attempt_at = NULL,
                    correlation_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE idempotency_key = ?
                """,
                command.ownerToken(),
                command.lease().toSeconds(),
                command.correlationId(),
                command.receiptKey());
        Receipt claimed = findLocked(command.receiptKey());
        return new ClaimResult(ClaimDisposition.CLAIMED, claimed);
    }

    private ClaimResult insertClaim(ClaimCommand command) {
        try {
            jdbc.update("""
                    INSERT INTO booking_idempotency (
                        idempotency_key, booking_id, operation, request_hash, state,
                        provider_key, correlation_id, lease_owner, lease_expires_at,
                        fence_token, attempt_count, updated_at
                    ) VALUES (
                        ?, ?, 'PRICE', ?, 'IN_PROGRESS',
                        ?, ?, ?, CURRENT_TIMESTAMP + (? * INTERVAL '1 second'),
                        1, 1, CURRENT_TIMESTAMP
                    )
                    """,
                    command.receiptKey(),
                    command.bookingId().value(),
                    command.inputHash(),
                    command.providerKey(),
                    command.correlationId(),
                    command.ownerToken(),
                    command.lease().toSeconds());
            return new ClaimResult(ClaimDisposition.CLAIMED, findLocked(command.receiptKey()));
        } catch (DuplicateKeyException exception) {
            return claim(command);
        }
    }

    @Override
    public Optional<Receipt> find(String receiptKey) {
        List<Receipt> rows = jdbc.query("""
                SELECT idempotency_key, booking_id, provider_key, request_hash, state,
                       lease_owner, lease_expires_at, fence_token, attempt_count,
                       next_attempt_at, response_snapshot, correlation_id
                FROM booking_idempotency
                WHERE idempotency_key = ?
                """, this::receipt, receiptKey);
        return rows.stream().findFirst();
    }

    @Override
    @Transactional
    public CompletionResult complete(CompletionCommand command) {
        if (command.response().amendmentSeq() != command.expectedAmendmentSeq()
                || !command.response().inputFingerprint().equals(command.expectedInputHash())) {
            return new CompletionResult(CompletionDisposition.BOOKING_CHANGED, command.response());
        }
        TerminalProjection terminal = terminal(command.response());
        int updated = jdbc.update("""
                UPDATE booking_idempotency receipt
                SET state = ?,
                    lease_owner = NULL,
                    lease_expires_at = NULL,
                    response_http_status = ?,
                    response_code = ?,
                    response_snapshot = ?,
                    retry_after_seconds = ?,
                    next_attempt_at = CASE
                        WHEN ? = 'RETRYABLE' AND ? <> 'BOOKING_CHANGED'
                            THEN CURRENT_TIMESTAMP + (? * INTERVAL '1 second')
                        ELSE NULL
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE receipt.idempotency_key = ?
                  AND receipt.state = 'IN_PROGRESS'
                  AND receipt.lease_owner = ?
                  AND receipt.fence_token = ?
                  AND receipt.request_hash = ?
                  AND EXISTS (
                      SELECT 1 FROM booking_records booking
                      WHERE booking.booking_id = receipt.booking_id
                        AND booking.booking_id = ?
                        AND booking.revision = ?
                  )
                """,
                terminal.state(),
                terminal.httpStatus(),
                terminal.code(),
                codec.write(command.response()),
                terminal.retryAfterSeconds(),
                terminal.state(),
                terminal.code(),
                terminal.retryAfterSeconds() == null ? 5 : terminal.retryAfterSeconds(),
                command.receiptKey(),
                command.ownerToken(),
                command.fenceToken(),
                command.expectedInputHash(),
                command.bookingId().value(),
                command.expectedRevision());
        if (updated == 0) {
            Integer revisionMatches = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM booking_records
                    WHERE booking_id = ? AND revision = ?
                    """, Integer.class, command.bookingId().value(), command.expectedRevision());
            if (revisionMatches == null || revisionMatches == 0) {
                return new CompletionResult(CompletionDisposition.BOOKING_CHANGED, command.response());
            }
            PricingCommandResult winner = find(command.receiptKey())
                    .map(Receipt::response)
                    .orElse(null);
            return new CompletionResult(
                    winner == null ? CompletionDisposition.STALE_OWNER : CompletionDisposition.REPLAY,
                    winner);
        }

        return new CompletionResult(CompletionDisposition.COMPLETED, command.response());
    }

    private Receipt findLocked(String receiptKey) {
        return jdbc.queryForObject("""
                SELECT idempotency_key, booking_id, provider_key, request_hash, state,
                       lease_owner, lease_expires_at, fence_token, attempt_count,
                       next_attempt_at, response_snapshot, correlation_id
                FROM booking_idempotency
                WHERE idempotency_key = ?
                FOR UPDATE
                """, this::receipt, receiptKey);
    }

    private Receipt receipt(ResultSet result, int rowNumber) throws SQLException {
        return new Receipt(
                result.getString("idempotency_key"),
                new BookingId(result.getString("booking_id")),
                result.getString("provider_key"),
                result.getString("request_hash"),
                result.getString("state"),
                result.getString("lease_owner"),
                instant(result.getTimestamp("lease_expires_at")),
                result.getLong("fence_token"),
                result.getInt("attempt_count"),
                instant(result.getTimestamp("next_attempt_at")),
                codec.read(result.getString("response_snapshot")),
                result.getString("correlation_id"));
    }

    private ReceiptWithDbTime receiptWithTime(ResultSet result, int rowNumber) throws SQLException {
        return new ReceiptWithDbTime(receipt(result, rowNumber), result.getTimestamp("db_now").toInstant());
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private static TerminalProjection terminal(PricingCommandResult response) {
        BookingPricingOutcome outcome = response.outcome();
        return switch (outcome) {
            case PRICED, LEGACY_PRICED -> new TerminalProjection("COMPLETED", 200, outcome.name(), null);
            case MANUAL_PRICING_REQUIRED, VALIDATION_FAILED ->
                new TerminalProjection("COMPLETED", 422, outcome.name(), null);
            case CONFLICT -> new TerminalProjection("COMPLETED", 409, outcome.name(), null);
            case IN_PROGRESS -> new TerminalProjection(
                    "RETRYABLE", 409, outcome.name(), Math.max(1, response.retryAfterSeconds()));
            case TIMEOUT -> new TerminalProjection("RETRYABLE", 504, outcome.name(), 5);
            case UNAVAILABLE, CIRCUIT_OPEN -> new TerminalProjection("RETRYABLE", 503, outcome.name(), 5);
            case DENIED -> new TerminalProjection("RETRYABLE", 403, outcome.name(), 5);
            case MALFORMED -> new TerminalProjection("RETRYABLE", 502, outcome.name(), 5);
            case BOOKING_CHANGED -> new TerminalProjection("RETRYABLE", 409, outcome.name(), null);
        };
    }

    private record ReceiptWithDbTime(Receipt receipt, Instant dbNow) {}

    private record TerminalProjection(
            String state, int httpStatus, String code, Integer retryAfterSeconds) {}
}
