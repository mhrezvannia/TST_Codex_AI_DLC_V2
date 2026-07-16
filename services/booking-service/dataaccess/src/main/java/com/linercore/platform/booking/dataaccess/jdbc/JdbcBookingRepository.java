package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcBookingRepository implements BookingRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcBookingRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public Booking save(Booking booking) {
        jdbc.update("""
                INSERT INTO booking_records
                    (booking_id, booking_number, status, revision, customer_id, origin_location_id,
                     destination_location_id, updated_at, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (booking_id) DO UPDATE SET
                    booking_number = EXCLUDED.booking_number,
                    status = EXCLUDED.status,
                    revision = EXCLUDED.revision,
                    customer_id = EXCLUDED.customer_id,
                    origin_location_id = EXCLUDED.origin_location_id,
                    destination_location_id = EXCLUDED.destination_location_id,
                    updated_at = EXCLUDED.updated_at,
                    snapshot = EXCLUDED.snapshot
                """,
                booking.id().value(),
                booking.bookingNumber(),
                booking.status().name(),
                booking.revision(),
                booking.customerId(),
                booking.originLocationId(),
                booking.destinationLocationId(),
                Timestamp.from(updatedAt(booking)),
                json.write(booking));
        return booking;
    }

    public Optional<Booking> findById(BookingId id) {
        List<Booking> rows = jdbc.query("""
                SELECT snapshot FROM booking_records
                WHERE booking_id = ?
                """, (rs, rowNum) -> read(rs), id.value());
        return rows.stream().findFirst();
    }

    public List<Booking> findRecent(int limit) {
        return jdbc.query("""
                SELECT snapshot FROM booking_records
                ORDER BY updated_at DESC, booking_id
                LIMIT ?
                """, (rs, rowNum) -> read(rs), Math.max(1, Math.min(limit, 100)));
    }

    private Instant updatedAt(Booking booking) {
        return booking.lifecycleEvents().stream()
                .map(event -> event.occurredAt())
                .max(java.util.Comparator.naturalOrder())
                .orElseGet(Instant::now);
    }

    private Booking read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), Booking.class);
    }
}
