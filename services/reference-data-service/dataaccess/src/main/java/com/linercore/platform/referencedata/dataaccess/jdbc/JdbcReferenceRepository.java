package com.linercore.platform.referencedata.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcReferenceRepository implements ReferenceRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcReferenceRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public ReferenceRecord save(ReferenceRecord record) {
        jdbc.update("""
                INSERT INTO reference_records
                    (reference_set, record_id, code, status, version, updated_at, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (reference_set, record_id) DO UPDATE SET
                    code = EXCLUDED.code,
                    status = EXCLUDED.status,
                    version = EXCLUDED.version,
                    updated_at = EXCLUDED.updated_at,
                    snapshot = EXCLUDED.snapshot
                """,
                record.set().name(),
                record.id().value(),
                record.code().value(),
                record.status().name(),
                record.version(),
                record.updatedAt() == null ? null : Timestamp.from(record.updatedAt()),
                json.write(record));
        return record;
    }

    public Optional<ReferenceRecord> findById(ReferenceSet set, ReferenceId id) {
        List<ReferenceRecord> rows = jdbc.query("""
                SELECT snapshot FROM reference_records
                WHERE reference_set = ? AND record_id = ?
                """, (rs, rowNum) -> read(rs), set.name(), id.value());
        return rows.stream().findFirst();
    }

    public List<ReferenceRecord> findBySet(ReferenceSet set, boolean includeInactive) {
        if (includeInactive) {
            return jdbc.query("""
                    SELECT snapshot FROM reference_records
                    WHERE reference_set = ?
                    ORDER BY code
                    """, (rs, rowNum) -> read(rs), set.name());
        }
        return jdbc.query("""
                SELECT snapshot FROM reference_records
                WHERE reference_set = ? AND status = 'ACTIVE'
                ORDER BY code
                """, (rs, rowNum) -> read(rs), set.name());
    }

    public Map<String, ReferenceRecord> activeRecordsById(ReferenceSet set) {
        return findBySet(set, false).stream()
                .collect(Collectors.toMap(record -> record.id().value(), record -> record));
    }

    public void rejectDuplicateActiveCode(ReferenceSet set, ReferenceCode code) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM reference_records
                WHERE reference_set = ? AND code = ? AND status = ?
                """, Integer.class, set.name(), code.value(), ReferenceStatus.ACTIVE.name());
        if (count != null && count > 0) {
            throw new IllegalArgumentException("duplicate active business key");
        }
    }

    private ReferenceRecord read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), ReferenceRecord.class);
    }
}
