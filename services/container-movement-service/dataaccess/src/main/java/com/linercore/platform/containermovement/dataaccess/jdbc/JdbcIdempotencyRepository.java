package com.linercore.platform.containermovement.dataaccess.jdbc;

import com.linercore.platform.containermovement.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcIdempotencyRepository implements IdempotencyRepository {
    private final JdbcTemplate jdbc;

    public JdbcIdempotencyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<JourneyId> findJourneyId(String idempotencyKey) {
        List<JourneyId> rows = jdbc.query("""
                SELECT journey_id FROM container_movement_idempotency
                WHERE idempotency_key = ? AND journey_id IS NOT NULL
                """, (rs, rowNum) -> new JourneyId(rs.getString("journey_id")), idempotencyKey);
        return rows.stream().findFirst();
    }

    public Optional<String> findMovementEventId(String idempotencyKey) {
        List<String> rows = jdbc.query("""
                SELECT movement_event_id FROM container_movement_idempotency
                WHERE idempotency_key = ? AND movement_event_id IS NOT NULL
                """, (rs, rowNum) -> rs.getString("movement_event_id"), idempotencyKey);
        return rows.stream().findFirst();
    }

    public void rememberJourney(String idempotencyKey, JourneyId journeyId) {
        jdbc.update("""
                INSERT INTO container_movement_idempotency (idempotency_key, journey_id)
                VALUES (?, ?)
                ON CONFLICT (idempotency_key) DO UPDATE SET
                    journey_id = EXCLUDED.journey_id
                """, idempotencyKey, journeyId.value());
    }

    public void rememberMovement(String idempotencyKey, String eventId) {
        jdbc.update("""
                INSERT INTO container_movement_idempotency (idempotency_key, movement_event_id)
                VALUES (?, ?)
                ON CONFLICT (idempotency_key) DO UPDATE SET
                    movement_event_id = EXCLUDED.movement_event_id
                """, idempotencyKey, eventId);
    }
}
