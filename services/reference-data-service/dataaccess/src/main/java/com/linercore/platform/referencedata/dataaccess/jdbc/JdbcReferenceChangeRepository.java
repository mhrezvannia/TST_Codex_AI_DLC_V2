package com.linercore.platform.referencedata.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcReferenceChangeRepository implements ReferenceChangeRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcReferenceChangeRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public void append(ReferenceChange change) {
        jdbc.update("""
                INSERT INTO reference_changes
                    (change_id, reference_set, record_id, operation, changed_at, correlation_id, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (change_id) DO NOTHING
                """,
                change.changeId(),
                change.referenceSet().name(),
                change.recordId().value(),
                change.operation().name(),
                change.changedAt() == null ? null : Timestamp.from(change.changedAt()),
                change.correlationId(),
                json.write(change));
    }

    public List<ReferenceChange> findByRecord(ReferenceSet set, ReferenceId id) {
        return jdbc.query("""
                SELECT snapshot FROM reference_changes
                WHERE reference_set = ? AND record_id = ?
                ORDER BY changed_at, change_id
                """, (rs, rowNum) -> read(rs), set.name(), id.value());
    }

    private ReferenceChange read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), ReferenceChange.class);
    }
}
