package com.linercore.platform.containermovement.dataaccess.jdbc;

import com.linercore.platform.containermovement.applicationservice.port.AuditRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class JdbcAuditRepository implements AuditRepository {
    private final JdbcTemplate jdbc;

    public JdbcAuditRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void append(String action, String journeyId, String actorSubjectId, String outcome, String reasonCode, String correlationId) {
        insert(action, journeyId, actorSubjectId, outcome, reasonCode, correlationId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void appendDurableRejection(
            String action,
            String journeyId,
            String actorSubjectId,
            String reasonCode,
            String correlationId) {
        insert(action, journeyId, actorSubjectId, "DENY", reasonCode, correlationId);
    }

    private void insert(
            String action,
            String journeyId,
            String actorSubjectId,
            String outcome,
            String reasonCode,
            String correlationId) {
        jdbc.update("""
                INSERT INTO container_movement_audit
                    (action, journey_id, actor_subject_id, outcome, reason_code, correlation_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """, action, journeyId, actorSubjectId, outcome, reasonCode, correlationId);
    }
}
