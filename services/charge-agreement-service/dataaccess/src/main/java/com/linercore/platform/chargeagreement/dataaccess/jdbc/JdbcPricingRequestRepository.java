package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestStatus;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredPricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcPricingRequestRepository implements PricingRequestRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcPricingRequestRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    @Override
    public Optional<StoredPricingRequest> findByIdempotencyKey(String idempotencyKey) {
        List<StoredPricingRequest> rows = jdbc.query("""
                SELECT * FROM pricing_requests WHERE idempotency_key = ?
                """, (rs, rowNum) -> read(rs), idempotencyKey);
        return rows.stream().findFirst();
    }

    @Override
    public boolean insertClaim(StoredPricingRequest claim) {
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
    public boolean completeOwned(String idempotencyKey, String ownerToken, PricingResult result, String terminalCode,
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
                result.manualPricingRequired() ? PricingRequestStatus.MANUAL.name() : PricingRequestStatus.COMPLETED.name(),
                json.write(result),
                terminalCode,
                timestamp(completedAt),
                idempotencyKey,
                ownerToken,
                PricingRequestStatus.IN_PROGRESS.name());
        return rows == 1;
    }

    private StoredPricingRequest read(ResultSet rs) throws SQLException {
        String snapshot = rs.getString("response_snapshot");
        return new StoredPricingRequest(
                rs.getString("idempotency_key"),
                rs.getString("booking_ref"),
                rs.getInt("amendment_seq"),
                rs.getString("request_hash"),
                PricingRequestStatus.valueOf(rs.getString("status")),
                rs.getString("owner_token"),
                instant(rs.getTimestamp("lease_until")),
                snapshot == null ? null : json.read(snapshot, PricingResult.class),
                rs.getString("terminal_code"),
                rs.getString("correlation_id"),
                instant(rs.getTimestamp("started_at")),
                instant(rs.getTimestamp("completed_at")));
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }
}
