package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.EventPublicationStatusView;
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

    public void enqueue(BookingOutboxEvent event) {
        saveInsertOnly(event);
    }

    public List<BookingOutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        List<BookingOutboxEvent> candidates = jdbc.query("""
                SELECT snapshot FROM booking_outbox
                WHERE status = 'PENDING'
                   OR (status = 'RETRYABLE' AND (next_attempt_at IS NULL OR next_attempt_at <= ?))
                ORDER BY occurred_at, event_id
                LIMIT ?
                """, (rs, rowNum) -> read(rs), Timestamp.from(now), batchSize);
        List<BookingOutboxEvent> claimed = new ArrayList<>();
        for (BookingOutboxEvent event : candidates) {
            BookingOutboxEvent next = event.claim(workerId, now);
            save(next);
            claimed.add(next);
        }
        return List.copyOf(claimed);
    }

    public void save(BookingOutboxEvent event) {
        jdbc.update("""
                INSERT INTO booking_outbox
                    (event_id, event_type, booking_id, booking_number, revision, schema_subject,
                     producer_identity, deduplication_key, correlation_id, occurred_at, status,
                     attempt_count, next_attempt_at, claimed_by, claimed_at, last_error_code,
                     last_error_message, snapshot)
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

    public Optional<BookingOutboxEvent> findByEventId(String eventId) {
        return jdbc.query("SELECT snapshot FROM booking_outbox WHERE event_id = ?",
                (rs, rowNum) -> read(rs), eventId).stream().findFirst();
    }

    public List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        StringBuilder sql = new StringBuilder("SELECT snapshot FROM booking_outbox WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (query.eventId() != null) {
            sql.append(" AND event_id = ?");
            args.add(query.eventId());
        }
        if (query.bookingId() != null) {
            sql.append(" AND booking_id = ?");
            args.add(query.bookingId());
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

    private void saveInsertOnly(BookingOutboxEvent event) {
        jdbc.update("""
                INSERT INTO booking_outbox
                    (event_id, event_type, booking_id, booking_number, revision, schema_subject,
                     producer_identity, deduplication_key, correlation_id, occurred_at, status,
                     attempt_count, next_attempt_at, claimed_by, claimed_at, last_error_code,
                     last_error_message, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO NOTHING
                """, values(event));
    }

    private Object[] values(BookingOutboxEvent event) {
        return new Object[] {
            event.eventId(), event.eventType(), event.bookingId(), event.bookingNumber(), event.revision(),
            event.schemaSubject(), event.producerIdentity(), event.deduplicationKey(), event.correlationId(),
            event.occurredAt() == null ? null : Timestamp.from(event.occurredAt()), event.status().name(),
            event.attemptCount(), event.nextAttemptAt() == null ? null : Timestamp.from(event.nextAttemptAt()),
            event.claimedBy(), event.claimedAt() == null ? null : Timestamp.from(event.claimedAt()),
            event.lastErrorCode(), event.lastErrorMessage(), json.write(event)
        };
    }

    private BookingOutboxEvent read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), BookingOutboxEvent.class);
    }

    private EventPublicationStatusView statusView(BookingOutboxEvent event) {
        String brokerMetadata = event.payload().containsKey("offset")
                ? event.payload().get("topic") + ":" + event.payload().get("partition") + ":" + event.payload().get("offset")
                : null;
        String lastError = event.lastErrorCode() == null
                ? null : event.lastErrorCode() + ": " + event.lastErrorMessage();
        Instant publishedAt = event.payload().containsKey("publishedAt")
                ? Instant.parse(event.payload().get("publishedAt")) : null;
        return new EventPublicationStatusView(event.eventId(), event.bookingId(), event.status(),
                event.attemptCount(), event.claimedAt(), publishedAt, brokerMetadata, lastError,
                event.correlationId());
    }
}
