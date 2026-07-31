package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepositoryException;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateApplicability;
import com.linercore.platform.chargeagreement.domain.rate.RateBasis;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateMoney;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

public final class JdbcRateRepository implements RateRepository {
    private static final String SEARCH_CTE = """
            WITH eligible_versions AS (
                SELECT v.*
                FROM charge_rate_versions v
                WHERE :lifecycle IS NULL
                   OR (:lifecycle = 'DRAFT' AND v.lifecycle = 'DRAFT')
                   OR (:lifecycle = 'SCHEDULED' AND v.lifecycle = 'APPROVED'
                       AND v.effective_from > CAST(:asOf AS date))
                   OR (:lifecycle = 'EFFECTIVE' AND v.lifecycle = 'APPROVED'
                       AND CAST(:asOf AS date) BETWEEN v.effective_from AND v.effective_to)
                   OR (:lifecycle = 'EXPIRED' AND v.lifecycle = 'APPROVED'
                       AND v.effective_to < CAST(:asOf AS date))
            ),
            ranked_versions AS (
                SELECT v.*,
                       COALESCE(v.updated_at, v.created_at) AS selected_updated_at,
                       ROW_NUMBER() OVER (
                           PARTITION BY v.rate_id
                           ORDER BY
                               CASE
                                   WHEN :lifecycle IS NOT NULL THEN 0
                                   WHEN v.lifecycle = 'APPROVED'
                                        AND CAST(:asOf AS date) BETWEEN v.effective_from AND v.effective_to THEN 0
                                   WHEN v.lifecycle = 'DRAFT' THEN 1
                                   WHEN v.lifecycle = 'APPROVED'
                                        AND v.effective_from > CAST(:asOf AS date) THEN 2
                                   WHEN v.lifecycle = 'APPROVED'
                                        AND v.effective_to < CAST(:asOf AS date) THEN 3
                                   ELSE 4
                               END,
                               CASE
                                   WHEN :lifecycle = 'SCHEDULED'
                                        OR (:lifecycle IS NULL AND v.lifecycle = 'APPROVED'
                                            AND v.effective_from > CAST(:asOf AS date))
                                   THEN v.effective_from
                               END ASC NULLS LAST,
                               CASE
                                   WHEN :lifecycle = 'EXPIRED'
                                        OR (:lifecycle IS NULL AND v.lifecycle = 'APPROVED'
                                            AND v.effective_to < CAST(:asOf AS date))
                                   THEN v.effective_to
                               END DESC NULLS LAST,
                               v.version_no DESC
                       ) AS selection_rank
                FROM eligible_versions v
            ),
            matching_rates AS (
                SELECT r.rate_id, rv.selected_updated_at
                FROM charge_rates r
                JOIN ranked_versions rv ON rv.rate_id = r.rate_id AND rv.selection_rank = 1
                WHERE (:category IS NULL OR r.category = :category)
                  AND (:originId IS NULL OR rv.origin_location_id = :originId)
                  AND (:destinationId IS NULL OR rv.destination_location_id = :destinationId)
                  AND (:equipmentTypeId IS NULL OR rv.equipment_type_id = :equipmentTypeId)
                  AND (:text IS NULL
                       OR POSITION(:text IN LOWER(r.rate_id)) > 0
                       OR POSITION(:text IN LOWER(r.charge_code)) > 0)
            )
            """;

    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;
    private final TransactionTemplate transactions;

    public JdbcRateRepository(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.namedJdbc = new NamedParameterJdbcTemplate(jdbc);
        this.transactions = transactions;
    }

    @Override
    public void create(Rate rate, RateActivity activity) {
        execute("RATE_CREATE_FAILED", () -> {
            jdbc.update("""
                    INSERT INTO charge_rates (
                        rate_id, category, charge_code_id, charge_code, next_version_no,
                        stable_row_version, created_by, created_at, correlation_id
                    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
                    """, rate.id().value(), rate.category().name(), rate.chargeCodeId().value(),
                    rate.chargeCode(), rate.nextVersionNo(), rate.createdBy(), timestamp(rate.createdAt()),
                    rate.correlationId());
            insertVersion(rate.latestVersion());
            insertActivity(activity);
            return null;
        });
    }

    @Override
    public Rate updateDraft(Rate stableRate, RateVersion revisedVersion, RateActivity activity) {
        return execute("RATE_VERSION_CONFLICT", () -> {
            int changed = jdbc.update("""
                    UPDATE charge_rate_versions SET
                        currency_id = ?, currency_code = ?, unit_rate = ?,
                        effective_from = ?, effective_to = ?, origin_location_id = ?,
                        destination_location_id = ?, equipment_type_id = ?,
                        row_version = ?, updated_by = ?, updated_at = ?, correlation_id = ?
                    WHERE version_id = ? AND rate_id = ? AND lifecycle = 'DRAFT' AND row_version = ?
                    """, revisedVersion.money().currencyId().value(), revisedVersion.money().currencyCode(),
                    revisedVersion.money().amount(), revisedVersion.effectiveFrom(), revisedVersion.effectiveTo(),
                    revisedVersion.applicability().originLocationId().value(),
                    destination(revisedVersion), revisedVersion.applicability().equipmentTypeId().value(),
                    revisedVersion.rowVersion(), revisedVersion.updatedBy(), timestamp(revisedVersion.updatedAt()),
                    revisedVersion.correlationId(), revisedVersion.id().value(), stableRate.id().value(),
                    revisedVersion.rowVersion() - 1);
            if (changed != 1) {
                throw new RateRepositoryException("RATE_VERSION_CONFLICT", "Draft update lost its optimistic race");
            }
            insertActivity(activity);
            return load(stableRate.id());
        });
    }

    @Override
    public Rate approveUnderLock(Rate stableRate, RateVersion approvedVersion, RateActivity activity) {
        return execute("RATE_AUTHORITY_CONFLICT", () -> {
            String approvalKey = approvedVersion.applicability()
                    .approvalKey(stableRate.category(), stableRate.chargeCodeId().value());
            jdbc.query("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))",
                    prepared -> prepared.setString(1, approvalKey),
                    resultSet -> null);
            Integer current = jdbc.queryForObject("""
                    SELECT row_version FROM charge_rate_versions
                    WHERE version_id = ? AND rate_id = ? AND lifecycle = 'DRAFT'
                    FOR UPDATE
                    """, Integer.class, approvedVersion.id().value(), stableRate.id().value());
            if (current == null || current.longValue() != approvedVersion.rowVersion() - 1) {
                throw new RateRepositoryException("RATE_VERSION_CONFLICT", "Approval lost its optimistic race");
            }
            Integer overlaps = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM charge_rate_versions candidate
                    JOIN charge_rates stable ON stable.rate_id = candidate.rate_id
                    WHERE candidate.lifecycle = 'APPROVED'
                      AND stable.category = ?
                      AND stable.charge_code_id = ?
                      AND candidate.origin_location_id = ?
                      AND candidate.equipment_type_id = ?
                      AND (
                          (? IS NULL AND candidate.destination_location_id IS NULL)
                          OR candidate.destination_location_id = ?
                      )
                      AND candidate.effective_from <= ?
                      AND candidate.effective_to >= ?
                      AND candidate.version_id <> ?
                    """, Integer.class, stableRate.category().name(), stableRate.chargeCodeId().value(),
                    approvedVersion.applicability().originLocationId().value(),
                    approvedVersion.applicability().equipmentTypeId().value(),
                    destination(approvedVersion), destination(approvedVersion),
                    approvedVersion.effectiveTo(), approvedVersion.effectiveFrom(), approvedVersion.id().value());
            if (overlaps != null && overlaps > 0) {
                throw new RateRepositoryException("RATE_AUTHORITY_CONFLICT", "Approved authority overlaps");
            }
            int changed = jdbc.update("""
                    UPDATE charge_rate_versions SET lifecycle = 'APPROVED', row_version = ?,
                        approved_by = ?, approved_at = ?, correlation_id = ?
                    WHERE version_id = ? AND rate_id = ? AND lifecycle = 'DRAFT' AND row_version = ?
                    """, approvedVersion.rowVersion(), approvedVersion.approvedBy(),
                    timestamp(approvedVersion.approvedAt()), approvedVersion.correlationId(),
                    approvedVersion.id().value(), stableRate.id().value(), approvedVersion.rowVersion() - 1);
            if (changed != 1) {
                throw new RateRepositoryException("RATE_VERSION_CONFLICT", "Approval lost its optimistic race");
            }
            insertActivity(activity);
            return load(stableRate.id());
        });
    }

    @Override
    public Rate createSuccessor(
            Rate stableRate,
            RateVersion sourceVersion,
            RateVersion successor,
            RateActivity activity) {
        return execute("RATE_DRAFT_EXISTS", () -> {
            Long next = jdbc.queryForObject(
                    "SELECT next_version_no FROM charge_rates WHERE rate_id = ? FOR UPDATE",
                    Long.class, stableRate.id().value());
            if (next == null || next != successor.versionNo()) {
                throw new RateRepositoryException("RATE_VERSION_CONFLICT", "Successor number changed");
            }
            Integer drafts = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM charge_rate_versions
                    WHERE rate_id = ? AND lifecycle = 'DRAFT'
                    """, Integer.class, stableRate.id().value());
            if (drafts != null && drafts > 0) {
                throw new RateRepositoryException("RATE_DRAFT_EXISTS", "A Draft already exists");
            }
            String sourceLifecycle = jdbc.queryForObject("""
                    SELECT lifecycle FROM charge_rate_versions
                    WHERE version_id = ? AND rate_id = ? FOR SHARE
                    """, String.class, sourceVersion.id().value(), stableRate.id().value());
            if (!RateLifecycle.APPROVED.name().equals(sourceLifecycle)) {
                throw new RateRepositoryException("RATE_VERSION_CONFLICT", "Successor source is not Approved");
            }
            insertVersion(successor);
            jdbc.update("""
                    UPDATE charge_rates
                    SET next_version_no = next_version_no + 1, stable_row_version = stable_row_version + 1
                    WHERE rate_id = ?
                    """, stableRate.id().value());
            insertActivity(activity);
            return load(stableRate.id());
        });
    }

    @Override
    public Optional<Rate> findById(RateId rateId) {
        List<Rate> values = jdbc.query("""
                SELECT rate_id, category, charge_code_id, charge_code, next_version_no,
                       created_by, created_at, correlation_id
                FROM charge_rates WHERE rate_id = ?
                """, (rs, row) -> readRate(rs), rateId.value());
        return values.stream().findFirst();
    }

    @Override
    public List<PricingCandidate> findApprovedPricingCandidates(PricingCandidateQuery query) {
        return jdbc.query("""
                SELECT r.rate_id, r.category, r.charge_code, v.version_id
                  FROM charge_rate_versions v
                  JOIN charge_rates r ON r.rate_id = v.rate_id
                 WHERE r.category = ?
                   AND v.lifecycle = 'APPROVED'
                   AND v.origin_location_id = ?
                   AND v.equipment_type_id = ?
                   AND v.effective_from <= ?
                   AND v.effective_to >= ?
                   AND ((? = 'LOCAL' AND v.destination_location_id IS NULL)
                        OR (? <> 'LOCAL' AND v.destination_location_id = ?))
                 ORDER BY v.version_id
                 LIMIT 2
                """,
                (resultSet, rowNumber) -> approvedPricingCandidate(
                        RateCategory.valueOf(resultSet.getString("category")),
                        resultSet.getString("charge_code"),
                        new RateId(resultSet.getString("rate_id")),
                        new RateVersionId(resultSet.getString("version_id"))),
                query.category().name(), query.originLocationId(), query.equipmentTypeId(),
                query.requestedDepartureDate(), query.requestedDepartureDate(),
                query.category().name(), query.category().name(), query.destinationLocationId());
    }

    @Override
    public Optional<PricingCandidate> findApprovedPricingVersion(RateVersionId versionId) {
        return jdbc.query("""
                SELECT r.rate_id, r.category, r.charge_code, v.version_id
                  FROM charge_rate_versions v
                  JOIN charge_rates r ON r.rate_id = v.rate_id
                 WHERE v.version_id = ? AND v.lifecycle = 'APPROVED'
                """,
                (resultSet, rowNumber) -> approvedPricingCandidate(
                        RateCategory.valueOf(resultSet.getString("category")),
                        resultSet.getString("charge_code"),
                        new RateId(resultSet.getString("rate_id")),
                        new RateVersionId(resultSet.getString("version_id"))),
                versionId.value()).stream().findFirst();
    }

    @Override
    public SearchPage search(SearchCriteria criteria) {
        MapSqlParameterSource parameters = searchParameters(criteria);
        Long total = namedJdbc.queryForObject(SEARCH_CTE
                + "SELECT COUNT(*) FROM matching_rates", parameters, Long.class);
        List<Rate> items = namedJdbc.query(SEARCH_CTE + """
                SELECT r.rate_id, r.category, r.charge_code_id, r.charge_code, r.next_version_no,
                       r.created_by, r.created_at, r.correlation_id
                FROM matching_rates matches
                JOIN charge_rates r ON r.rate_id = matches.rate_id
                ORDER BY matches.selected_updated_at DESC, r.rate_id
                LIMIT :limit OFFSET :offset
                """, parameters, (rs, row) -> readRate(rs));
        return new SearchPage(items, total == null ? 0 : total);
    }

    @Override
    public List<RateActivity> activities(RateId rateId) {
        return jdbc.query("""
                SELECT activity_id, rate_id, version_id, version_no, action, actor_subject_id,
                       occurred_at, correlation_id, reason, resulting_row_version
                FROM charge_rate_activity WHERE rate_id = ?
                ORDER BY occurred_at, activity_id
                """, (rs, row) -> new RateActivity(
                rs.getString("activity_id"),
                new RateId(rs.getString("rate_id")),
                new RateVersionId(rs.getString("version_id")),
                rs.getLong("version_no"),
                RateActivity.Action.valueOf(rs.getString("action")),
                rs.getString("actor_subject_id"),
                rs.getTimestamp("occurred_at").toInstant(),
                rs.getString("correlation_id"),
                rs.getString("reason"),
                rs.getLong("resulting_row_version")), rateId.value());
    }

    private Rate readRate(ResultSet resultSet) throws SQLException {
        RateId id = new RateId(resultSet.getString("rate_id"));
        List<RateVersion> versions = jdbc.query("""
                SELECT version_id, rate_id, version_no, lifecycle, basis, currency_id, currency_code,
                       unit_rate, effective_from, effective_to, origin_location_id,
                       destination_location_id, equipment_type_id, row_version, source_version_id,
                       created_by, created_at, updated_by, updated_at, approved_by, approved_at, correlation_id
                FROM charge_rate_versions WHERE rate_id = ? ORDER BY version_no
                """, (rs, row) -> readVersion(rs), id.value());
        return new Rate(id, RateCategory.valueOf(resultSet.getString("category")),
                new ReferenceId(resultSet.getString("charge_code_id")), resultSet.getString("charge_code"),
                resultSet.getLong("next_version_no"), resultSet.getString("created_by"),
                resultSet.getTimestamp("created_at").toInstant(), resultSet.getString("correlation_id"), versions);
    }

    private static MapSqlParameterSource searchParameters(SearchCriteria criteria) {
        String text = criteria.query() == null || criteria.query().isBlank()
                ? null : criteria.query().strip().toLowerCase(java.util.Locale.ROOT);
        return new MapSqlParameterSource()
                .addValue("lifecycle", criteria.lifecycle() == null ? null : criteria.lifecycle().name(),
                        Types.VARCHAR)
                .addValue("asOf", criteria.asOf(), Types.DATE)
                .addValue("category", criteria.category() == null ? null : criteria.category().name(), Types.VARCHAR)
                .addValue("originId", blankToNull(criteria.originLocationId()), Types.VARCHAR)
                .addValue("destinationId", blankToNull(criteria.destinationLocationId()), Types.VARCHAR)
                .addValue("equipmentTypeId", blankToNull(criteria.equipmentTypeId()), Types.VARCHAR)
                .addValue("text", text, Types.VARCHAR)
                .addValue("limit", criteria.limit(), Types.INTEGER)
                .addValue("offset", criteria.offset(), Types.BIGINT);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static RateVersion readVersion(ResultSet resultSet) throws SQLException {
        String source = resultSet.getString("source_version_id");
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        Timestamp approvedAt = resultSet.getTimestamp("approved_at");
        return new RateVersion(
                new RateVersionId(resultSet.getString("version_id")),
                new RateId(resultSet.getString("rate_id")),
                resultSet.getLong("version_no"),
                RateLifecycle.valueOf(resultSet.getString("lifecycle")),
                RateBasis.valueOf(resultSet.getString("basis")),
                new RateMoney(resultSet.getBigDecimal("unit_rate"),
                        new ReferenceId(resultSet.getString("currency_id")), resultSet.getString("currency_code")),
                resultSet.getDate("effective_from").toLocalDate(),
                resultSet.getDate("effective_to").toLocalDate(),
                new RateApplicability(
                        new ReferenceId(resultSet.getString("origin_location_id")),
                        nullableReference(resultSet.getString("destination_location_id")),
                        new ReferenceId(resultSet.getString("equipment_type_id"))),
                resultSet.getLong("row_version"),
                source == null ? null : new RateVersionId(source),
                resultSet.getString("created_by"),
                resultSet.getTimestamp("created_at").toInstant(),
                resultSet.getString("updated_by"),
                updatedAt == null ? null : updatedAt.toInstant(),
                resultSet.getString("approved_by"),
                approvedAt == null ? null : approvedAt.toInstant(),
                resultSet.getString("correlation_id"));
    }

    private void insertVersion(RateVersion version) {
        jdbc.update("""
                INSERT INTO charge_rate_versions (
                    version_id, rate_id, version_no, lifecycle, basis, currency_id, currency_code,
                    unit_rate, effective_from, effective_to, origin_location_id,
                    destination_location_id, equipment_type_id, row_version, source_version_id,
                    created_by, created_at, updated_by, updated_at, approved_by, approved_at, correlation_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, version.id().value(), version.rateId().value(), version.versionNo(),
                version.lifecycle().name(), version.basis().name(), version.money().currencyId().value(),
                version.money().currencyCode(), version.money().amount(), version.effectiveFrom(),
                version.effectiveTo(), version.applicability().originLocationId().value(), destination(version),
                version.applicability().equipmentTypeId().value(), version.rowVersion(),
                version.sourceVersionId() == null ? null : version.sourceVersionId().value(),
                version.createdBy(), timestamp(version.createdAt()), version.updatedBy(), timestamp(version.updatedAt()),
                version.approvedBy(), timestamp(version.approvedAt()), version.correlationId());
    }

    private void insertActivity(RateActivity activity) {
        jdbc.update("""
                INSERT INTO charge_rate_activity (
                    activity_id, rate_id, version_id, version_no, action, actor_subject_id,
                    occurred_at, correlation_id, reason, resulting_row_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, activity.activityId(), activity.rateId().value(), activity.versionId().value(),
                activity.versionNo(), activity.action().name(), activity.actorSubjectId(),
                timestamp(activity.occurredAt()), activity.correlationId(), activity.reason(),
                activity.resultingRowVersion());
    }

    private Rate load(RateId id) {
        return findById(id).orElseThrow(() ->
                new RateRepositoryException("RATE_NOT_FOUND", "Rate disappeared during transaction"));
    }

    private PricingCandidate approvedPricingCandidate(
            RateCategory category,
            String chargeCode,
            RateId rateId,
            RateVersionId versionId) {
        RateVersion version = findById(rateId).orElseThrow(() ->
                        new RateRepositoryException("RATE_NOT_FOUND", "Pricing rate disappeared during read"))
                .versions().stream()
                .filter(candidate -> candidate.id().equals(versionId))
                .findFirst()
                .orElseThrow(() -> new RateRepositoryException(
                        "RATE_VERSION_NOT_FOUND", "Pricing rate version disappeared during read"));
        return new PricingCandidate(category, chargeCode, version);
    }

    private <T> T execute(String defaultCode, java.util.concurrent.Callable<T> work) {
        try {
            return transactions.execute(status -> {
                try {
                    return work.call();
                } catch (RateRepositoryException exception) {
                    status.setRollbackOnly();
                    throw exception;
                } catch (Exception exception) {
                    status.setRollbackOnly();
                    throw new RateRepositoryException(defaultCode, "Rate persistence failed", exception);
                }
            });
        } catch (DataIntegrityViolationException exception) {
            throw new RateRepositoryException(defaultCode, "Rate invariant rejected", exception);
        }
    }

    private static String destination(RateVersion version) {
        return version.applicability().destinationLocationId() == null
                ? null : version.applicability().destinationLocationId().value();
    }

    private static ReferenceId nullableReference(String value) {
        return value == null ? null : new ReferenceId(value);
    }

    private static Timestamp timestamp(java.time.Instant value) {
        return value == null ? null : Timestamp.from(value);
    }
}
