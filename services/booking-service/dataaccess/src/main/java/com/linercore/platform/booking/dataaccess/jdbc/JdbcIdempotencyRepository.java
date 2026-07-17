package com.linercore.platform.booking.dataaccess.jdbc;

import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.IdempotencyReceipt;
import com.linercore.platform.booking.domain.model.BookingId;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcIdempotencyRepository implements IdempotencyRepository {
    private final JdbcTemplate jdbc;

    public JdbcIdempotencyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<BookingId> findBookingId(String idempotencyKey) {
        List<BookingId> rows = jdbc.query("""
                SELECT booking_id FROM booking_idempotency
                WHERE idempotency_key = ?
                """, (rs, rowNum) -> new BookingId(rs.getString("booking_id")), idempotencyKey);
        return rows.stream().findFirst();
    }

    public void remember(String idempotencyKey, BookingId bookingId) {
        jdbc.update("""
                INSERT INTO booking_idempotency (idempotency_key, booking_id)
                VALUES (?, ?)
                ON CONFLICT (idempotency_key) DO NOTHING
                """, idempotencyKey, bookingId.value());
    }

    @Override
    public Optional<IdempotencyReceipt> findReceipt(String idempotencyKey) {
        List<IdempotencyReceipt> rows = jdbc.query("""
                SELECT idempotency_key, operation, request_hash, booking_id, state, response_revision
                FROM booking_idempotency
                WHERE idempotency_key = ?
                """, (rs, rowNum) -> new IdempotencyReceipt(
                rs.getString("idempotency_key"),
                rs.getString("operation"),
                rs.getString("request_hash"),
                new BookingId(rs.getString("booking_id")),
                rs.getString("state"),
                (Integer) rs.getObject("response_revision")), idempotencyKey);
        return rows.stream().findFirst();
    }

    @Override
    public boolean claim(String idempotencyKey, String operation, String requestHash, BookingId bookingId) {
        return jdbc.update("""
                INSERT INTO booking_idempotency
                    (idempotency_key, operation, request_hash, booking_id, state, updated_at)
                VALUES (?, ?, ?, ?, 'IN_PROGRESS', CURRENT_TIMESTAMP)
                ON CONFLICT (idempotency_key) DO NOTHING
                """, idempotencyKey, operation, requestHash, bookingId.value()) == 1;
    }

    @Override
    public void complete(String idempotencyKey, int responseRevision) {
        int updated = jdbc.update("""
                UPDATE booking_idempotency
                SET state = 'COMPLETED', response_revision = ?, updated_at = CURRENT_TIMESTAMP
                WHERE idempotency_key = ? AND state = 'IN_PROGRESS'
                """, responseRevision, idempotencyKey);
        if (updated != 1) {
            throw new IllegalStateException("idempotency receipt completion lost ownership");
        }
    }
}
