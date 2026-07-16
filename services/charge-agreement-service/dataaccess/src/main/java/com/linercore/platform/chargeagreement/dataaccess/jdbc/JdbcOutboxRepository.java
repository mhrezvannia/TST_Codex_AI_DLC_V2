package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.EventPublicationStatusView;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcOutboxRepository implements OutboxRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcOutboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    @Override
    public void enqueue(AgreementOutboxEvent event) {
        jdbc.update("""
                INSERT INTO charge_agreement_outbox
                    (event_id, event_type, agreement_id, agreement_status, agreement_version,
                     schema_subject, producer_identity, deduplication_key, correlation_id, occurred_at,
                     status, attempt_count, next_attempt_at, claimed_by, claimed_at,
                     last_error_code, last_error_message, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO NOTHING
                """, values(event));
    }

    @Override
    public List<AgreementOutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        List<AgreementOutboxEvent> candidates = jdbc.query("""
                SELECT snapshot FROM charge_agreement_outbox
                WHERE status = 'PENDING'
                   OR (status = 'RETRYABLE' AND (next_attempt_at IS NULL OR next_attempt_at <= ?))
                ORDER BY occurred_at, event_id
                LIMIT ?
                """, (rs, rowNum) -> read(rs), Timestamp.from(now), batchSize);
        List<AgreementOutboxEvent> claimed = new ArrayList<>();
        for (AgreementOutboxEvent event : candidates) {
            AgreementOutboxEvent next = event.claim(workerId, now);
            save(next);
            claimed.add(next);
        }
        return List.copyOf(claimed);
    }

    @Override
    public void save(AgreementOutboxEvent event) {
        jdbc.update("""
                INSERT INTO charge_agreement_outbox
                    (event_id, event_type, agreement_id, agreement_status, agreement_version,
                     schema_subject, producer_identity, deduplication_key, correlation_id, occurred_at,
                     status, attempt_count, next_attempt_at, claimed_by, claimed_at,
                     last_error_code, last_error_message, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    attempt_count = EXCLUDED.attempt_count,
                    next_attempt_at = EXCLUDED.next_attempt_at,
                    claimed_by = EXCLUDED.claimed_by,
                    claimed_at = EXCLUDED.claimed_at,
                    last_error_code = EXCLUDED.last_error_code,
                    last_error_message = EXCLUDED.last_error_message,
                    snapshot = EXCLUDED.snapshot
                """, values(event));
    }

    @Override
    public Optional<AgreementOutboxEvent> findByEventId(String eventId) {
        return jdbc.query("SELECT snapshot FROM charge_agreement_outbox WHERE event_id = ?",
                (rs, rowNum) -> read(rs), eventId).stream().findFirst();
    }

    @Override
    public List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        StringBuilder sql = new StringBuilder("SELECT snapshot FROM charge_agreement_outbox WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (query.eventId() != null) {
            sql.append(" AND event_id = ?");
            args.add(query.eventId());
        }
        if (query.agreementId() != null) {
            sql.append(" AND agreement_id = ?");
            args.add(query.agreementId());
        }
        if (query.status() != null) {
            sql.append(" AND status = ?");
            args.add(query.status().name());
        }
        if (query.from() != null) {
            sql.append(" AND occurred_at >= ?");
            args.add(Timestamp.from(query.from()));
        }
        if (query.to() != null) {
            sql.append(" AND occurred_at <= ?");
            args.add(Timestamp.from(query.to()));
        }
        sql.append(" ORDER BY occurred_at DESC, event_id LIMIT ?");
        args.add(query.boundedLimit());
        return jdbc.query(sql.toString(), (rs, rowNum) -> statusView(read(rs)), args.toArray());
    }

    private Object[] values(AgreementOutboxEvent event) {
        return new Object[] {
            event.eventId(), event.eventType(), event.agreementId(), event.agreementStatus(),
            event.agreementVersion(), event.schemaSubject(), event.producerIdentity(), event.deduplicationKey(),
            event.correlationId(), event.occurredAt() == null ? null : Timestamp.from(event.occurredAt()),
            event.status().name(), event.attemptCount(),
            event.nextAttemptAt() == null ? null : Timestamp.from(event.nextAttemptAt()), event.claimedBy(),
            event.claimedAt() == null ? null : Timestamp.from(event.claimedAt()), event.lastErrorCode(),
            event.lastErrorMessage(), json.write(event)
        };
    }

    private AgreementOutboxEvent read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), AgreementOutboxEvent.class);
    }

    private EventPublicationStatusView statusView(AgreementOutboxEvent event) {
        String brokerMetadata = event.payload().containsKey("offset")
                ? event.payload().get("topic") + ":" + event.payload().get("partition") + ":" + event.payload().get("offset")
                : null;
        String lastError = event.lastErrorCode() == null
                ? null : event.lastErrorCode() + ": " + event.lastErrorMessage();
        Instant publishedAt = event.payload().containsKey("publishedAt")
                ? Instant.parse(event.payload().get("publishedAt")) : null;
        return new EventPublicationStatusView(event.eventId(), event.agreementId(), event.status(),
                event.attemptCount(), event.claimedAt(), publishedAt, brokerMetadata, lastError,
                event.correlationId());
    }
}
