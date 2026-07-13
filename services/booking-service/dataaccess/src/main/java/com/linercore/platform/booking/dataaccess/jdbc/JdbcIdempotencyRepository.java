package com.linercore.platform.booking.dataaccess.jdbc;

import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
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
}
