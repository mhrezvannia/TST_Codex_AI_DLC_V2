package com.linercore.platform.booking.dataaccess.jdbc;

import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import com.linercore.platform.booking.applicationservice.port.ConsumedEventDisposition;
import com.linercore.platform.booking.applicationservice.port.MovementLocation;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjection;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjectionRepository;
import com.linercore.platform.booking.applicationservice.port.ProjectionUpsertResult;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcMovementStatusProjectionRepository implements MovementStatusProjectionRepository {
    private final JdbcTemplate jdbc;

    public JdbcMovementStatusProjectionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public boolean insertReceipt(MovementStatusReceivedEvent event, Instant consumedAt) {
        return jdbc.update("""
                INSERT INTO booking_consumed_events
                    (event_id, event_type, source, data_schema_version, booking_ref, container_ref,
                     correlation_id, consumed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (event_id) DO NOTHING
                """,
                event.eventId(), event.eventType(), event.source(), event.dataSchemaVersion(), event.bookingRef(),
                event.containerRef(), event.correlationId(), Timestamp.from(consumedAt)) == 1;
    }

    @Override
    public ProjectionUpsertResult upsert(MovementStatusProjection projection) {
        int changed = jdbc.update("""
                INSERT INTO booking_movement_status
                    (booking_ref, container_ref, movement_id, move_code, event_classifier_code, classifier_rank,
                     occurred_date_time, received_date_time, derived_status, empty_indicator_code, transshipment,
                     location_unlocode, facility_code, facility_type_code, event_id, source, event_time,
                     data_schema_version, correlation_id, projected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (booking_ref, container_ref) DO UPDATE SET
                    movement_id = EXCLUDED.movement_id,
                    move_code = EXCLUDED.move_code,
                    event_classifier_code = EXCLUDED.event_classifier_code,
                    classifier_rank = EXCLUDED.classifier_rank,
                    occurred_date_time = EXCLUDED.occurred_date_time,
                    received_date_time = EXCLUDED.received_date_time,
                    derived_status = EXCLUDED.derived_status,
                    empty_indicator_code = EXCLUDED.empty_indicator_code,
                    transshipment = EXCLUDED.transshipment,
                    location_unlocode = EXCLUDED.location_unlocode,
                    facility_code = EXCLUDED.facility_code,
                    facility_type_code = EXCLUDED.facility_type_code,
                    event_id = EXCLUDED.event_id,
                    source = EXCLUDED.source,
                    event_time = EXCLUDED.event_time,
                    data_schema_version = EXCLUDED.data_schema_version,
                    correlation_id = EXCLUDED.correlation_id,
                    projected_at = EXCLUDED.projected_at
                WHERE (EXCLUDED.occurred_date_time, EXCLUDED.classifier_rank, EXCLUDED.received_date_time,
                       EXCLUDED.event_id)
                    > (booking_movement_status.occurred_date_time, booking_movement_status.classifier_rank,
                       booking_movement_status.received_date_time, booking_movement_status.event_id)
                """,
                projection.bookingRef(), projection.containerRef(), projection.movementId(), projection.moveCode(),
                projection.eventClassifierCode(), projection.classifierRank(),
                Timestamp.from(projection.occurredDateTime()), Timestamp.from(projection.receivedDateTime()),
                projection.derivedStatus(), projection.emptyIndicatorCode(), projection.transshipment(),
                projection.location() == null ? null : projection.location().unLocationCode(),
                projection.location() == null ? null : projection.location().facilityCode(),
                projection.location() == null ? null : projection.location().facilityTypeCode(),
                projection.eventId(), projection.source(), Timestamp.from(projection.eventTime()),
                projection.dataSchemaVersion(), projection.correlationId(), Timestamp.from(projection.projectedAt()));
        MovementStatusProjection winner = findLatest(projection.bookingRef(), projection.containerRef()).orElse(projection);
        return new ProjectionUpsertResult(changed == 1
                && projection.eventId().equals(winner.eventId()) ? ConsumedEventDisposition.APPLIED
                : ConsumedEventDisposition.STALE, winner);
    }

    @Override
    public void markReceiptDisposition(String eventId, ConsumedEventDisposition disposition) {
        jdbc.update("""
                UPDATE booking_consumed_events
                SET disposition = ?
                WHERE event_id = ?
                """, disposition.name(), eventId);
    }

    @Override
    public Optional<MovementStatusProjection> findLatest(String bookingRef, String containerRef) {
        List<MovementStatusProjection> rows = jdbc.query("""
                SELECT * FROM booking_movement_status
                WHERE booking_ref = ? AND container_ref = ?
                """, (rs, rowNum) -> read(rs), bookingRef, containerRef);
        return rows.stream().findFirst();
    }

    @Override
    public List<MovementStatusProjection> findByBookingRef(String bookingRef) {
        return jdbc.query("""
                SELECT * FROM booking_movement_status
                WHERE booking_ref = ?
                ORDER BY occurred_date_time DESC, classifier_rank DESC, received_date_time DESC, event_id DESC
                """, (rs, rowNum) -> read(rs), bookingRef);
    }

    private MovementStatusProjection read(ResultSet rs) throws SQLException {
        MovementLocation location = rs.getString("location_unlocode") == null
                && rs.getString("facility_code") == null
                && rs.getString("facility_type_code") == null
                ? null
                : new MovementLocation(rs.getString("location_unlocode"), rs.getString("facility_code"),
                        rs.getString("facility_type_code"));
        return new MovementStatusProjection(
                rs.getString("booking_ref"),
                rs.getString("container_ref"),
                rs.getString("movement_id"),
                rs.getString("move_code"),
                rs.getString("event_classifier_code"),
                rs.getInt("classifier_rank"),
                rs.getTimestamp("occurred_date_time").toInstant(),
                rs.getTimestamp("received_date_time").toInstant(),
                rs.getString("derived_status"),
                rs.getString("empty_indicator_code"),
                rs.getBoolean("transshipment"),
                location,
                rs.getString("event_id"),
                rs.getString("source"),
                rs.getTimestamp("event_time").toInstant(),
                rs.getInt("data_schema_version"),
                rs.getString("correlation_id"),
                rs.getTimestamp("projected_at").toInstant());
    }
}
