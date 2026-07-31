package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;

public final class JdbcPricingSnapshotRepository implements PricingSnapshotRepository {
    private static final int MAX_LIMIT = PricingHistoryPage.MAX_PAGE_SIZE;

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public JdbcPricingSnapshotRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @Override
    public void append(BookingId bookingId, PricingSnapshot snapshot) {
        if (snapshot.typed() == null) {
            return;
        }
        var typed = snapshot.typed();
        try {
            jdbc.update("""
                    INSERT INTO booking_pricing_snapshots (
                        booking_id, pricing_request_id, amendment_seq, booking_revision,
                        schema_version, snapshot, correlation_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    bookingId.value(),
                    typed.pricingRequestId(),
                    typed.amendmentSeq(),
                    typed.bookingRevision(),
                    typed.schemaVersion(),
                    write(snapshot),
                    typed.correlationId(),
                    Timestamp.from(typed.createdAt()));
        } catch (DuplicateKeyException exception) {
            String existing = jdbc.queryForObject("""
                    SELECT snapshot FROM booking_pricing_snapshots
                    WHERE booking_id = ? AND pricing_request_id = ?
                    """, String.class, bookingId.value(), typed.pricingRequestId());
            if (!write(snapshot).equals(existing)) {
                throw new IllegalStateException("pricing snapshot identity conflict", exception);
            }
        }
    }

    @Override
    public PricingHistoryPage findHistory(BookingId bookingId, String cursor, int limit) {
        int bounded = Math.max(1, Math.min(MAX_LIMIT, limit));
        Cursor after = cursor == null || cursor.isBlank() ? null : Cursor.decode(cursor);
        List<Row> rows = after == null
                ? jdbc.query("""
                        SELECT amendment_seq, created_at, pricing_request_id, snapshot
                        FROM booking_pricing_snapshots
                        WHERE booking_id = ?
                        ORDER BY amendment_seq DESC, created_at DESC, pricing_request_id DESC
                        LIMIT ?
                        """, this::row, bookingId.value(), bounded + 1)
                : jdbc.query("""
                        SELECT amendment_seq, created_at, pricing_request_id, snapshot
                        FROM booking_pricing_snapshots
                        WHERE booking_id = ?
                          AND (amendment_seq, created_at, pricing_request_id) < (?, ?, ?)
                        ORDER BY amendment_seq DESC, created_at DESC, pricing_request_id DESC
                        LIMIT ?
                        """, this::row, bookingId.value(), after.amendmentSeq(), Timestamp.from(after.createdAt()),
                        after.pricingRequestId(), bounded + 1);
        boolean hasMore = rows.size() > bounded;
        List<Row> page = hasMore ? rows.subList(0, bounded) : rows;
        if (page.isEmpty()) {
            return new PricingHistoryPage(null, List.of(), null);
        }
        PricingSnapshot current = read(page.get(0).snapshot());
        List<PricingSnapshot> prior = new ArrayList<>();
        for (int index = 1; index < page.size(); index++) {
            prior.add(read(page.get(index).snapshot()));
        }
        Row last = page.get(page.size() - 1);
        String next = hasMore
                ? new Cursor(last.amendmentSeq(), last.createdAt(), last.pricingRequestId()).encode()
                : null;
        return new PricingHistoryPage(current, prior, next);
    }

    private Row row(ResultSet result, int rowNumber) throws SQLException {
        return new Row(
                result.getInt("amendment_seq"),
                result.getTimestamp("created_at").toInstant(),
                result.getString("pricing_request_id"),
                result.getString("snapshot"));
    }

    private String write(PricingSnapshot snapshot) {
        try {
            return mapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("cannot serialize pricing snapshot", exception);
        }
    }

    private PricingSnapshot read(String snapshot) {
        try {
            return mapper.readValue(snapshot, PricingSnapshot.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("cannot deserialize pricing snapshot", exception);
        }
    }

    private record Row(int amendmentSeq, Instant createdAt, String pricingRequestId, String snapshot) {}

    private record Cursor(int amendmentSeq, Instant createdAt, String pricingRequestId) {
        String encode() {
            String raw = amendmentSeq + "|" + createdAt + "|" + pricingRequestId;
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        }

        static Cursor decode(String value) {
            try {
                String raw = new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
                String[] parts = raw.split("\\|", 3);
                return new Cursor(Integer.parseInt(parts[0]), Instant.parse(parts[1]), parts[2]);
            } catch (RuntimeException exception) {
                throw new IllegalArgumentException("invalid pricing history cursor", exception);
            }
        }
    }
}
