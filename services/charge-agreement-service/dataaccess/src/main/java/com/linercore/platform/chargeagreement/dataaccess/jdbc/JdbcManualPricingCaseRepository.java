package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcManualPricingCaseRepository implements ManualPricingCaseRepository {
    private static final String SELECT_COLUMNS = """
            case_id, pricing_request_id, reason_code, status, booking_ref,
            amendment_seq, request_hash, correlation_id, opened_at, snapshot, dedupe_key
            """;

    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcManualPricingCaseRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    @Override
    public void save(ManualPricingCase manualPricingCase) {
        createOrGetOpen(manualPricingCase);
    }

    @Override
    public ManualPricingCase createOrGetOpen(ManualPricingCase proposedCase) {
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, status, booking_ref,
                     amendment_seq, request_hash, correlation_id, opened_at, snapshot, dedupe_key)
                VALUES (?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (dedupe_key) DO NOTHING
                """,
                proposedCase.caseId(),
                proposedCase.pricingRequestId(),
                proposedCase.reasonCode(),
                proposedCase.bookingRef(),
                proposedCase.amendmentSeq(),
                proposedCase.requestHash(),
                proposedCase.correlationId(),
                timestamp(proposedCase.openedAt()),
                proposedCase.requestContext() == null ? "{}" : json.write(proposedCase.requestContext()),
                proposedCase.dedupeKey());
        return jdbc.query("""
                        SELECT %s
                          FROM manual_pricing_cases
                         WHERE dedupe_key = ?
                        """.formatted(SELECT_COLUMNS),
                this::read,
                proposedCase.dedupeKey()).stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("canonical manual pricing case is unavailable"));
    }

    @Override
    public ManualCasePage listOpen(ManualCaseQuery query) {
        SqlFilter filter = filter(query);
        long total = Optional.ofNullable(jdbc.queryForObject(
                "SELECT COUNT(*) FROM manual_pricing_cases WHERE status = 'OPEN'" + filter.clause(),
                Long.class,
                filter.arguments().toArray())).orElse(0L);
        List<Object> pageArguments = new ArrayList<>(filter.arguments());
        pageArguments.add(query.size());
        pageArguments.add(query.offset());
        List<ManualPricingCase> items = jdbc.query("""
                        SELECT %s
                          FROM manual_pricing_cases
                         WHERE status = 'OPEN'%s
                         ORDER BY opened_at DESC NULLS LAST, case_id ASC
                         LIMIT ? OFFSET ?
                        """.formatted(SELECT_COLUMNS, filter.clause()),
                this::read,
                pageArguments.toArray());
        return new ManualCasePage(items, total, query.page(), query.size());
    }

    @Override
    public Optional<ManualPricingCase> findOpenById(String caseId) {
        return jdbc.query("""
                        SELECT %s
                          FROM manual_pricing_cases
                         WHERE case_id = ? AND status = 'OPEN'
                        """.formatted(SELECT_COLUMNS),
                this::read,
                caseId).stream().findFirst();
    }

    private SqlFilter filter(ManualCaseQuery query) {
        StringBuilder sql = new StringBuilder();
        List<Object> arguments = new ArrayList<>();
        if (query.reasonCode() != null && !query.reasonCode().isBlank()) {
            sql.append(" AND reason_code = ?");
            arguments.add(query.reasonCode().trim());
        }
        if (query.bookingRef() != null && !query.bookingRef().isBlank()) {
            sql.append(" AND booking_ref = ?");
            arguments.add(query.bookingRef().trim());
        }
        if (query.openedFrom() != null) {
            sql.append(" AND opened_at >= ?");
            arguments.add(timestamp(query.openedFrom()));
        }
        if (query.openedTo() != null) {
            sql.append(" AND opened_at <= ?");
            arguments.add(timestamp(query.openedTo()));
        }
        return new SqlFilter(sql.toString(), List.copyOf(arguments));
    }

    private ManualPricingCase read(ResultSet rs, int rowNumber) throws SQLException {
        String bookingRef = rs.getString("booking_ref");
        Integer amendmentSeq = nullableInteger(rs, "amendment_seq");
        String requestHash = rs.getString("request_hash");
        boolean legacyEvidence = bookingRef == null || amendmentSeq == null || requestHash == null;
        ManualPricingCase.RequestContext context = null;
        if (!legacyEvidence) {
            String snapshot = rs.getString("snapshot");
            context = json.read(snapshot, ManualPricingCase.RequestContext.class);
        }
        return new ManualPricingCase(
                rs.getString("case_id"),
                rs.getString("pricing_request_id"),
                rs.getString("reason_code"),
                rs.getString("status"),
                bookingRef,
                amendmentSeq,
                requestHash,
                rs.getString("correlation_id"),
                instant(rs.getTimestamp("opened_at")),
                context,
                legacyEvidence);
    }

    private static Integer nullableInteger(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private record SqlFilter(String clause, List<Object> arguments) {
    }
}
