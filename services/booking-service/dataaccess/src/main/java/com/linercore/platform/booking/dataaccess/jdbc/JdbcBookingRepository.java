package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcBookingRepository implements BookingRepository {
    private final JdbcTemplate jdbc;
    private final BookingSnapshotCodec snapshots;

    public JdbcBookingRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.snapshots = new BookingSnapshotCodec(mapper);
    }

    public Booking save(Booking booking) {
        jdbc.update("""
                INSERT INTO booking_records
                    (booking_id, booking_number, status, revision, customer_id, origin_location_id,
                     destination_location_id, equipment_type_code, snapshot_version, updated_at, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, ?, ?)
                ON CONFLICT (booking_id) DO UPDATE SET
                    booking_number = EXCLUDED.booking_number,
                    status = EXCLUDED.status,
                    revision = EXCLUDED.revision,
                    customer_id = EXCLUDED.customer_id,
                    origin_location_id = EXCLUDED.origin_location_id,
                    destination_location_id = EXCLUDED.destination_location_id,
                    equipment_type_code = EXCLUDED.equipment_type_code,
                    snapshot_version = EXCLUDED.snapshot_version,
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
                booking.equipmentType(),
                Timestamp.from(updatedAt(booking)),
                snapshots.write(booking));
        return booking;
    }

    public Optional<Booking> findById(BookingId id) {
        List<Booking> rows = jdbc.query("""
                SELECT snapshot FROM booking_records
                WHERE booking_id = ?
                """, (rs, rowNum) -> read(rs), id.value());
        return rows.stream().findFirst();
    }

    @Override
    public Optional<Booking> findByIdForUpdate(BookingId id) {
        List<Booking> rows = jdbc.query("""
                SELECT snapshot FROM booking_records
                WHERE booking_id = ?
                FOR UPDATE
                """, (rs, rowNum) -> read(rs), id.value());
        return rows.stream().findFirst();
    }

    public List<Booking> findRecent(int limit) {
        return findPage(null, null, 0, limit);
    }

    @Override
    public List<Booking> findPage(String search, BookingStatus status, int page, int size) {
        int boundedSize = Math.max(1, Math.min(size, 100));
        int boundedPage = Math.max(0, page);
        StringBuilder sql = new StringBuilder("SELECT snapshot FROM booking_records WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(booking_number) LIKE ? OR LOWER(customer_id) LIKE ?)");
            String pattern = "%" + search.trim().toLowerCase(java.util.Locale.ROOT) + "%";
            args.add(pattern);
            args.add(pattern);
        }
        if (status != null) {
            sql.append(" AND status = ?");
            args.add(status.name());
        }
        sql.append(" ORDER BY updated_at DESC, booking_id DESC LIMIT ? OFFSET ?");
        args.add(boundedSize);
        args.add(boundedPage * boundedSize);
        return jdbc.query(sql.toString(), (rs, rowNum) -> read(rs), args.toArray());
    }

    private Instant updatedAt(Booking booking) {
        return booking.lifecycleEvents().stream()
                .map(event -> event.occurredAt())
                .max(java.util.Comparator.naturalOrder())
                .orElseGet(Instant::now);
    }

    private Booking read(ResultSet rs) throws SQLException {
        return snapshots.read(rs.getString("snapshot"));
    }
}
