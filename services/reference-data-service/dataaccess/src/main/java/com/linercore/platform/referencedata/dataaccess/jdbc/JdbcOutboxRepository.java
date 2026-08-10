package com.linercore.platform.referencedata.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
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

    public void enqueue(OutboxEvent event) {
        saveInsertOnly(event);
    }

    public List<OutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        List<OutboxEvent> candidates = jdbc.query("""
                SELECT snapshot FROM reference_outbox
                WHERE status = 'PENDING'
                   OR (status = 'RETRYABLE' AND (next_attempt_at IS NULL OR next_attempt_at <= ?))
                ORDER BY occurred_at, event_id
                LIMIT ?
                """, (rs, rowNum) -> read(rs), Timestamp.from(now), batchSize);
        List<OutboxEvent> claimed = new ArrayList<>();
        for (OutboxEvent event : candidates) {
            OutboxEvent next = event.claim(workerId, now);
            save(next);
            claimed.add(next);
        }
        return List.copyOf(claimed);
    }

    public void save(OutboxEvent event) {
        jdbc.update("""
                INSERT INTO reference_outbox
                    (event_id, reference_set, record_id, operation, status, attempt_count, next_attempt_at,
                     claimed_by, claimed_at, occurred_at, correlation_id, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    attempt_count = EXCLUDED.attempt_count,
                    next_attempt_at = EXCLUDED.next_attempt_at,
                    claimed_by = EXCLUDED.claimed_by,
                    claimed_at = EXCLUDED.claimed_at,
                    snapshot = EXCLUDED.snapshot
                """,
                event.eventId(),
                event.referenceSet().name(),
                event.entityId(),
                event.operation().name(),
                event.status().name(),
                event.attemptCount(),
                event.nextAttemptAt() == null ? null : Timestamp.from(event.nextAttemptAt()),
                event.claimedBy(),
                event.claimedAt() == null ? null : Timestamp.from(event.claimedAt()),
                event.occurredAt() == null ? null : Timestamp.from(event.occurredAt()),
                event.correlationId(),
                json.write(event));
    }

    public Optional<OutboxEvent> findByEventId(String eventId) {
        List<OutboxEvent> rows = jdbc.query("""
                SELECT snapshot FROM reference_outbox
                WHERE event_id = ?
                """, (rs, rowNum) -> read(rs), eventId);
        return rows.stream().findFirst();
    }

    public List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return jdbc.query(statusSql(query), (rs, rowNum) -> statusView(read(rs)), statusArgs(query).toArray());
    }

    private void saveInsertOnly(OutboxEvent event) {
        jdbc.update("""
                INSERT INTO reference_outbox
                    (event_id, reference_set, record_id, operation, status, attempt_count, next_attempt_at,
                     claimed_by, claimed_at, occurred_at, correlation_id, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO NOTHING
                """,
                event.eventId(),
                event.referenceSet().name(),
                event.entityId(),
                event.operation().name(),
                event.status().name(),
                event.attemptCount(),
                event.nextAttemptAt() == null ? null : Timestamp.from(event.nextAttemptAt()),
                event.claimedBy(),
                event.claimedAt() == null ? null : Timestamp.from(event.claimedAt()),
                event.occurredAt() == null ? null : Timestamp.from(event.occurredAt()),
                event.correlationId(),
                json.write(event));
    }

    private String statusSql(OutboxStatusQuery query) {
        StringBuilder sql = new StringBuilder("SELECT snapshot FROM reference_outbox WHERE 1=1");
        if (query.eventId() != null) sql.append(" AND event_id = ?");
        if (query.recordId() != null) sql.append(" AND record_id = ?");
        if (query.referenceSet() != null) sql.append(" AND reference_set = ?");
        if (query.status() != null) sql.append(" AND status = ?");
        if (query.from() != null) sql.append(" AND occurred_at >= ?");
        if (query.to() != null) sql.append(" AND occurred_at <= ?");
        sql.append(" ORDER BY occurred_at DESC, event_id LIMIT ?");
        return sql.toString();
    }

    private List<Object> statusArgs(OutboxStatusQuery query) {
        List<Object> args = new ArrayList<>();
        if (query.eventId() != null) args.add(query.eventId());
        if (query.recordId() != null) args.add(query.recordId());
        if (query.referenceSet() != null) args.add(query.referenceSet().name());
        if (query.status() != null) args.add(query.status().name());
        if (query.from() != null) args.add(Timestamp.from(query.from()));
        if (query.to() != null) args.add(Timestamp.from(query.to()));
        args.add(query.boundedLimit());
        return args;
    }

    private OutboxEvent read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), OutboxEvent.class);
    }

    private EventPublicationStatusView statusView(OutboxEvent event) {
        String brokerMetadata = event.payload().containsKey("offset")
                ? event.payload().get("topic") + ":" + event.payload().get("partition") + ":" + event.payload().get("offset")
                : null;
        String lastError = event.lastErrorCode() == null ? null : event.lastErrorCode() + ": " + event.lastErrorMessage();
        Instant publishedAt = event.payload().containsKey("publishedAt") ? Instant.parse(event.payload().get("publishedAt")) : null;
        return new EventPublicationStatusView(event.eventId(), event.entityId(), event.referenceSet(), event.operation().name(),
                event.status(), event.attemptCount(), event.claimedAt(), publishedAt, brokerMetadata, lastError, event.correlationId());
    }
}
