package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepositoryException;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementNumber;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementValidity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

public final class JdbcW2AgreementRepository implements W2AgreementRepository {
    private final JdbcTemplate jdbc;

    public JdbcW2AgreementRepository(JdbcTemplate jdbc) {
        this.jdbc = Objects.requireNonNull(jdbc);
    }

    @Override
    public void create(Agreement agreement, AgreementActivity activity) {
        execute("AGREEMENT_CREATE_FAILED", () -> {
            AgreementVersion version = agreement.latestVersion();
            jdbc.update("""
                    INSERT INTO charge_agreements (
                        id, agreement_number, customer_id, trade_lane_id, commodity_id,
                        valid_from, valid_to, status, version, created_by, created_at,
                        snapshot, authority_model
                    ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, '{}', 'W2_VERSIONED')
                    """,
                    agreement.id().value(), agreement.number().value(), version.customerId().value(),
                    version.tradeLaneId().value(), version.validity().validFrom(), version.validity().validTo(),
                    version.lifecycle().name(), version.versionNo(), version.createdBy(),
                    timestamp(version.createdAt()));
            insertVersion(version);
            insertLinks(version);
            insertActivity(activity);
            return null;
        });
    }

    @Override
    public Agreement updateDraft(
            Agreement stable, AgreementVersion revisedVersion, AgreementActivity activity) {
        return execute("AGREEMENT_STALE_VERSION", () -> {
            int changed = jdbc.update("""
                    UPDATE charge_agreement_versions SET
                        customer_id = ?, trade_lane_id = ?, origin_location_id = ?,
                        destination_location_id = ?, equipment_type_id = ?,
                        valid_from = ?, valid_to = ?, row_version = ?,
                        updated_by = ?, updated_at = ?, correlation_id = ?
                    WHERE agreement_version_id = ? AND agreement_id = ?
                      AND authority_model = 'W2_VERSIONED' AND lifecycle = 'DRAFT'
                      AND row_version = ?
                    """,
                    revisedVersion.customerId().value(), revisedVersion.tradeLaneId().value(),
                    revisedVersion.originLocationId().value(), revisedVersion.destinationLocationId().value(),
                    revisedVersion.equipmentTypeId().value(), revisedVersion.validity().validFrom(),
                    revisedVersion.validity().validTo(), revisedVersion.rowVersion(), revisedVersion.updatedBy(),
                    timestamp(revisedVersion.updatedAt()), revisedVersion.correlationId(),
                    revisedVersion.id().value(), stable.id().value(), revisedVersion.rowVersion() - 1);
            if (changed != 1) {
                throw failure("AGREEMENT_STALE_VERSION", "Draft update lost its optimistic race");
            }
            replaceLinks(revisedVersion);
            updateHeaderProjection(stable, revisedVersion);
            insertActivity(activity);
            return load(stable.id());
        });
    }

    @Override
    public Agreement createSuccessor(
            Agreement stable,
            AgreementVersion source,
            AgreementVersion successor,
            AgreementActivity activity) {
        return execute("AGREEMENT_DRAFT_EXISTS", () -> {
            String authority = jdbc.queryForObject("""
                    SELECT authority_model FROM charge_agreements
                    WHERE id = ? FOR UPDATE
                    """, String.class, stable.id().value());
            if (!AgreementAuthorityModel.W2_VERSIONED.name().equals(authority)) {
                throw failure("AGREEMENT_AUTHORITY_CONFLICT", "Agreement is not W2 governed");
            }
            Long next = jdbc.queryForObject("""
                    SELECT COALESCE(MAX(version_no), 0) + 1
                    FROM charge_agreement_versions WHERE agreement_id = ?
                    """, Long.class, stable.id().value());
            if (next == null || next != successor.versionNo()) {
                throw failure("AGREEMENT_STALE_VERSION", "Successor version number changed");
            }
            Integer drafts = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM charge_agreement_versions
                    WHERE agreement_id = ? AND authority_model = 'W2_VERSIONED' AND lifecycle = 'DRAFT'
                    """, Integer.class, stable.id().value());
            if (drafts != null && drafts > 0) {
                throw failure("AGREEMENT_DRAFT_EXISTS", "A Draft already exists");
            }
            String sourceLifecycle = jdbc.queryForObject("""
                    SELECT lifecycle FROM charge_agreement_versions
                    WHERE agreement_version_id = ? AND agreement_id = ? FOR SHARE
                    """, String.class, source.id().value(), stable.id().value());
            if (!AgreementLifecycle.APPROVED.name().equals(sourceLifecycle)) {
                throw failure("AGREEMENT_STALE_VERSION", "Successor source is not Approved");
            }
            insertVersion(successor);
            insertLinks(successor);
            updateHeaderProjection(stable, successor);
            insertActivity(activity);
            return load(stable.id());
        });
    }

    @Override
    public Agreement approveUnderLock(
            Agreement stable,
            AgreementVersion draft,
            long expectedRowVersion,
            ApprovalValidation validation,
            String actor,
            Instant at,
            String correlationId,
            String activityId,
            String reason) {
        return execute("AGREEMENT_AUTHORITY_CONFLICT", () -> {
            AgreementVersion candidate = loadVersion(stable.id(), draft.id());
            jdbc.query("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))",
                    statement -> statement.setString(1, candidate.approvalKey()),
                    resultSet -> null);
            AgreementVersion locked = loadVersionForUpdate(stable.id(), draft.id());
            if (!locked.approvalKey().equals(candidate.approvalKey())
                    || locked.lifecycle() != AgreementLifecycle.DRAFT
                    || locked.rowVersion() != expectedRowVersion) {
                throw failure("AGREEMENT_STALE_VERSION", "Approval lost its optimistic race");
            }
            validation.validate(locked);
            Integer overlaps = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM charge_agreement_versions candidate
                    WHERE candidate.authority_model = 'W2_VERSIONED'
                      AND candidate.w2_authority_eligible = TRUE
                      AND candidate.lifecycle = 'APPROVED'
                      AND candidate.customer_id = ?
                      AND candidate.trade_lane_id = ?
                      AND candidate.origin_location_id = ?
                      AND candidate.destination_location_id = ?
                      AND candidate.equipment_type_id = ?
                      AND candidate.valid_from <= ?
                      AND candidate.valid_to >= ?
                      AND candidate.agreement_version_id <> ?
                    """,
                    Integer.class, locked.customerId().value(), locked.tradeLaneId().value(),
                    locked.originLocationId().value(), locked.destinationLocationId().value(),
                    locked.equipmentTypeId().value(), locked.validity().validTo(),
                    locked.validity().validFrom(), locked.id().value());
            if (overlaps != null && overlaps > 0) {
                throw failure("AGREEMENT_AUTHORITY_CONFLICT", "Approved Agreement authority overlaps");
            }
            AgreementVersion approved = locked.approve(expectedRowVersion, actor, at, correlationId);
            int changed = jdbc.update("""
                    UPDATE charge_agreement_versions SET
                        lifecycle = 'APPROVED', row_version = ?,
                        approved_by = ?, approved_at = ?, correlation_id = ?
                    WHERE agreement_version_id = ? AND agreement_id = ?
                      AND authority_model = 'W2_VERSIONED' AND lifecycle = 'DRAFT'
                      AND row_version = ?
                    """,
                    approved.rowVersion(), approved.approvedBy(), timestamp(approved.approvedAt()),
                    approved.correlationId(), approved.id().value(), stable.id().value(), expectedRowVersion);
            if (changed != 1) {
                throw failure("AGREEMENT_STALE_VERSION", "Approval lost its optimistic race");
            }
            updateHeaderProjection(stable, approved);
            insertActivity(new AgreementActivity(
                    activityId, stable.id(), approved.id(), AgreementActivityAction.APPROVED,
                    actor, at, correlationId, reason, approved.rowVersion()));
            return load(stable.id());
        });
    }

    @Override
    public Agreement transitionLifecycle(
            Agreement stable, AgreementVersion transitionedVersion, AgreementActivity activity) {
        return execute("AGREEMENT_STALE_VERSION", () -> {
            int changed = jdbc.update("""
                    UPDATE charge_agreement_versions SET
                        lifecycle = ?, row_version = ?, updated_by = ?, updated_at = ?, correlation_id = ?
                    WHERE agreement_version_id = ? AND agreement_id = ?
                      AND authority_model = 'W2_VERSIONED' AND lifecycle = 'APPROVED'
                      AND row_version = ?
                    """,
                    transitionedVersion.lifecycle().name(), transitionedVersion.rowVersion(),
                    transitionedVersion.updatedBy(), timestamp(transitionedVersion.updatedAt()),
                    transitionedVersion.correlationId(), transitionedVersion.id().value(),
                    stable.id().value(), transitionedVersion.rowVersion() - 1);
            if (changed != 1) {
                throw failure("AGREEMENT_STALE_VERSION", "Lifecycle transition lost its optimistic race");
            }
            updateHeaderProjection(stable, transitionedVersion);
            insertActivity(activity);
            return load(stable.id());
        });
    }

    @Override
    public Optional<Agreement> findById(AgreementId agreementId) {
        List<Agreement> values = jdbc.query("""
                SELECT id, agreement_number, authority_model
                FROM charge_agreements
                WHERE id = ? AND authority_model = 'W2_VERSIONED'
                """, (resultSet, rowNumber) -> loadHeader(resultSet), agreementId.value());
        return values.stream().findFirst();
    }

    @Override
    public List<AgreementVersion> findApprovedPricingCandidates(PricingCandidateQuery query) {
        return jdbc.query("""
                SELECT agreement_id, agreement_version_id
                  FROM charge_agreement_versions
                 WHERE authority_model = 'W2_VERSIONED'
                   AND w2_authority_eligible = TRUE
                   AND lifecycle = 'APPROVED'
                   AND customer_id = ?
                   AND trade_lane_id = ?
                   AND origin_location_id = ?
                   AND destination_location_id = ?
                   AND equipment_type_id = ?
                   AND valid_from <= ?
                   AND valid_to >= ?
                 ORDER BY agreement_version_id
                 LIMIT 2
                """,
                (resultSet, rowNumber) -> approvedPricingVersion(
                        new AgreementId(resultSet.getString("agreement_id")),
                        new AgreementVersionId(resultSet.getString("agreement_version_id"))),
                query.customerId(), query.tradeLaneId(), query.originLocationId(),
                query.destinationLocationId(), query.equipmentTypeId(),
                query.requestedDepartureDate(), query.requestedDepartureDate());
    }

    @Override
    public Optional<AgreementVersion> findApprovedPricingVersion(AgreementVersionId versionId) {
        return jdbc.query("""
                SELECT agreement_id, agreement_version_id
                  FROM charge_agreement_versions
                 WHERE agreement_version_id = ?
                   AND authority_model = 'W2_VERSIONED'
                   AND w2_authority_eligible = TRUE
                   AND lifecycle = 'APPROVED'
                """,
                (resultSet, rowNumber) -> approvedPricingVersion(
                        new AgreementId(resultSet.getString("agreement_id")),
                        new AgreementVersionId(resultSet.getString("agreement_version_id"))),
                versionId.value()).stream().findFirst();
    }

    Agreement loadAny(AgreementId agreementId) {
        List<Agreement> values = jdbc.query("""
                SELECT id, agreement_number, authority_model
                FROM charge_agreements WHERE id = ?
                """, (resultSet, rowNumber) -> loadHeader(resultSet), agreementId.value());
        return values.stream().findFirst()
                .orElseThrow(() -> failure("AGREEMENT_NOT_FOUND", "Agreement was not found"));
    }

    private Agreement load(AgreementId id) {
        return findById(id).orElseThrow(() -> failure("AGREEMENT_NOT_FOUND", "Agreement was not found"));
    }

    private AgreementVersion approvedPricingVersion(AgreementId agreementId, AgreementVersionId versionId) {
        return findById(agreementId).orElseThrow(() ->
                        failure("AGREEMENT_NOT_FOUND", "Pricing Agreement disappeared during read"))
                .versions().stream()
                .filter(candidate -> candidate.id().equals(versionId))
                .findFirst()
                .orElseThrow(() ->
                        failure("AGREEMENT_VERSION_NOT_FOUND", "Pricing Agreement version disappeared during read"));
    }

    private Agreement loadHeader(ResultSet resultSet) throws SQLException {
        AgreementId id = new AgreementId(resultSet.getString("id"));
        return new Agreement(
                id,
                new AgreementNumber(resultSet.getString("agreement_number")),
                AgreementAuthorityModel.valueOf(resultSet.getString("authority_model")),
                loadVersions(id));
    }

    private List<AgreementVersion> loadVersions(AgreementId id) {
        return jdbc.query("""
                SELECT * FROM charge_agreement_versions
                WHERE agreement_id = ? ORDER BY version_no
                """, (resultSet, rowNumber) -> mapVersion(resultSet, loadLinks(
                        new AgreementVersionId(resultSet.getString("agreement_version_id")))), id.value());
    }

    private AgreementVersion loadVersionForUpdate(AgreementId agreementId, AgreementVersionId versionId) {
        List<AgreementVersion> values = jdbc.query("""
                SELECT * FROM charge_agreement_versions
                WHERE agreement_id = ? AND agreement_version_id = ?
                  AND authority_model = 'W2_VERSIONED'
                FOR UPDATE
                """, (resultSet, rowNumber) -> mapVersion(resultSet, loadLinks(versionId)),
                agreementId.value(), versionId.value());
        return values.stream().findFirst()
                .orElseThrow(() -> failure("AGREEMENT_NOT_FOUND", "Agreement Draft was not found"));
    }

    private AgreementVersion loadVersion(AgreementId agreementId, AgreementVersionId versionId) {
        List<AgreementVersion> values = jdbc.query("""
                SELECT * FROM charge_agreement_versions
                WHERE agreement_id = ? AND agreement_version_id = ?
                  AND authority_model = 'W2_VERSIONED'
                """, (resultSet, rowNumber) -> mapVersion(resultSet, loadLinks(versionId)),
                agreementId.value(), versionId.value());
        return values.stream().findFirst()
                .orElseThrow(() -> failure("AGREEMENT_NOT_FOUND", "Agreement Draft was not found"));
    }

    private List<AgreementRateLink> loadLinks(AgreementVersionId versionId) {
        return jdbc.query("""
                SELECT rate_category, rate_version_id
                FROM charge_agreement_rate_links
                WHERE agreement_version_id = ?
                ORDER BY rate_category
                """, (resultSet, rowNumber) -> new AgreementRateLink(
                        RateCategory.valueOf(resultSet.getString("rate_category")),
                        new RateVersionId(resultSet.getString("rate_version_id"))),
                versionId.value());
    }

    private AgreementVersion mapVersion(ResultSet resultSet, List<AgreementRateLink> links) throws SQLException {
        AgreementAuthorityModel authority =
                AgreementAuthorityModel.valueOf(resultSet.getString("authority_model"));
        return new AgreementVersion(
                new AgreementVersionId(resultSet.getString("agreement_version_id")),
                new AgreementId(resultSet.getString("agreement_id")),
                resultSet.getLong("version_no"),
                authority,
                AgreementLifecycle.valueOf(resultSet.getString("lifecycle")),
                new ReferenceId(resultSet.getString("customer_id")),
                new ReferenceId(resultSet.getString("trade_lane_id")),
                nullableReference(resultSet.getString("origin_location_id")),
                nullableReference(resultSet.getString("destination_location_id")),
                nullableReference(resultSet.getString("equipment_type_id")),
                nullableReference(resultSet.getString("commodity_id")),
                new AgreementValidity(
                        resultSet.getDate("valid_from").toLocalDate(),
                        resultSet.getDate("valid_to").toLocalDate()),
                links,
                resultSet.getLong("row_version"),
                nullableVersionId(resultSet.getString("source_version_id")),
                resultSet.getString("created_by"),
                instant(resultSet.getTimestamp("created_at")),
                resultSet.getString("updated_by"),
                instant(resultSet.getTimestamp("updated_at")),
                resultSet.getString("approved_by"),
                instant(resultSet.getTimestamp("approved_at")),
                defaultText(resultSet.getString("correlation_id"),
                        authority == AgreementAuthorityModel.LEGACY ? "legacy-history" : "missing-correlation"));
    }

    private void insertVersion(AgreementVersion version) {
        jdbc.update("""
                INSERT INTO charge_agreement_versions (
                    agreement_version_id, agreement_id, version_no, authority_model,
                    w2_authority_eligible, customer_id, trade_lane_id, origin_location_id,
                    destination_location_id, equipment_type_id, commodity_id, valid_from,
                    valid_to, lifecycle, legacy_status, row_version, source_version_id,
                    created_by, created_at, updated_by, updated_at, approved_by,
                    approved_at, correlation_id, snapshot
                ) VALUES (?, ?, ?, 'W2_VERSIONED', TRUE, ?, ?, ?, ?, ?, NULL, ?, ?, ?,
                          NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
                """,
                version.id().value(), version.agreementId().value(), version.versionNo(),
                version.customerId().value(), version.tradeLaneId().value(),
                version.originLocationId().value(), version.destinationLocationId().value(),
                version.equipmentTypeId().value(), version.validity().validFrom(),
                version.validity().validTo(), version.lifecycle().name(), version.rowVersion(),
                nullable(version.sourceVersionId()), version.createdBy(), timestamp(version.createdAt()),
                version.updatedBy(), timestamp(version.updatedAt()), version.approvedBy(),
                timestamp(version.approvedAt()), version.correlationId());
    }

    private void insertLinks(AgreementVersion version) {
        for (AgreementRateLink link : version.links()) {
            jdbc.update("""
                    INSERT INTO charge_agreement_rate_links (
                        agreement_version_id, rate_category, rate_version_id,
                        linked_by, linked_at, correlation_id
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    version.id().value(), link.category().name(), link.rateVersionId().value(),
                    version.createdBy(), timestamp(version.createdAt()), version.correlationId());
        }
    }

    private void replaceLinks(AgreementVersion version) {
        jdbc.update("DELETE FROM charge_agreement_rate_links WHERE agreement_version_id = ?",
                version.id().value());
        insertLinks(version);
    }

    private void insertActivity(AgreementActivity activity) {
        jdbc.update("""
                INSERT INTO charge_agreement_activity (
                    agreement_id, action, actor, occurred_at, reason, activity_id,
                    agreement_version_id, actor_subject_id, correlation_id, resulting_row_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                activity.agreementId().value(), activity.action().name(), activity.actorSubjectId(),
                timestamp(activity.occurredAt()), activity.reason(), activity.activityId(),
                activity.agreementVersionId().value(), activity.actorSubjectId(),
                activity.correlationId(), activity.resultingRowVersion());
    }

    private void updateHeaderProjection(Agreement stable, AgreementVersion version) {
        jdbc.update("""
                UPDATE charge_agreements SET
                    customer_id = ?, trade_lane_id = ?, commodity_id = NULL,
                    valid_from = ?, valid_to = ?, status = ?, version = ?,
                    updated_by = ?, updated_at = ?
                WHERE id = ? AND authority_model = 'W2_VERSIONED'
                """,
                version.customerId().value(), version.tradeLaneId().value(),
                version.validity().validFrom(), version.validity().validTo(),
                version.lifecycle().name(), version.versionNo(),
                defaultText(version.updatedBy(), version.createdBy()),
                timestamp(version.updatedAt() == null ? version.createdAt() : version.updatedAt()),
                stable.id().value());
    }

    private <T> T execute(String defaultCode, SqlWork<T> work) {
        try {
            return work.run();
        } catch (AgreementRepositoryException exception) {
            throw exception;
        } catch (DataIntegrityViolationException exception) {
            String message = exception.getMostSpecificCause().getMessage();
            String code = message != null && message.contains("uq_cav_one_draft_per_agreement")
                    ? "AGREEMENT_DRAFT_EXISTS"
                    : defaultCode;
            throw new AgreementRepositoryException(code, "Agreement persistence constraint rejected the operation",
                    exception);
        } catch (RuntimeException exception) {
            throw new AgreementRepositoryException(defaultCode, "Agreement persistence failed", exception);
        }
    }

    private static AgreementRepositoryException failure(String code, String message) {
        return new AgreementRepositoryException(code, message);
    }

    private static Timestamp timestamp(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }

    private static ReferenceId nullableReference(String value) {
        return value == null ? null : new ReferenceId(value);
    }

    private static AgreementVersionId nullableVersionId(String value) {
        return value == null ? null : new AgreementVersionId(value);
    }

    private static String nullable(AgreementVersionId value) {
        return value == null ? null : value.value();
    }

    private static String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    @FunctionalInterface
    private interface SqlWork<T> {
        T run();
    }
}
