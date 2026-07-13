package com.linercore.platform.containermovement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.containermovement.applicationservice.port.JourneyRepository;
import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcJourneyRepository implements JourneyRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcJourneyRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public ContainerJourney save(ContainerJourney journey) {
        jdbc.update("""
                INSERT INTO container_journeys
                    (journey_id, booking_id, booking_revision, container_id, movement_status, updated_at, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (journey_id) DO UPDATE SET
                    booking_id = EXCLUDED.booking_id,
                    booking_revision = EXCLUDED.booking_revision,
                    container_id = EXCLUDED.container_id,
                    movement_status = EXCLUDED.movement_status,
                    updated_at = EXCLUDED.updated_at,
                    snapshot = EXCLUDED.snapshot
                """,
                journey.id().value(),
                journey.bookingId(),
                journey.bookingRevision(),
                journey.containerId(),
                journey.status().name(),
                journey.updatedAt() == null ? null : Timestamp.from(journey.updatedAt()),
                json.write(journey));
        return journey;
    }

    public Optional<ContainerJourney> findById(JourneyId id) {
        List<ContainerJourney> rows = jdbc.query("""
                SELECT snapshot FROM container_journeys
                WHERE journey_id = ?
                """, (rs, rowNum) -> read(rs), id.value());
        return rows.stream().findFirst();
    }

    public Optional<ContainerJourney> findByBookingId(String bookingId) {
        List<ContainerJourney> rows = jdbc.query("""
                SELECT snapshot FROM container_journeys
                WHERE booking_id = ?
                ORDER BY updated_at DESC, journey_id
                LIMIT 1
                """, (rs, rowNum) -> read(rs), bookingId);
        return rows.stream().findFirst();
    }

    public List<ContainerJourney> findRecent(int limit) {
        return jdbc.query("""
                SELECT snapshot FROM container_journeys
                ORDER BY updated_at DESC, journey_id
                LIMIT ?
                """, (rs, rowNum) -> read(rs), Math.max(1, Math.min(limit, 100)));
    }

    private ContainerJourney read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), ContainerJourney.class);
    }
}
