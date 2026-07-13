package com.linercore.platform.booking.dataaccess.jdbc;

import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcAuditRepository implements AuditRepository {
    private final JdbcTemplate jdbc;

    public JdbcAuditRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void append(String eventType, String bookingId, String actorSubjectId, String result, String reason, String correlationId) {
        jdbc.update("""
                INSERT INTO booking_audit
                    (event_type, booking_id, actor_subject_id, result, reason, correlation_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """, eventType, bookingId, actorSubjectId, result, reason, correlationId);
    }
}
