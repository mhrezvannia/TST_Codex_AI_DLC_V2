package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public final class JdbcAgreementAdminReadRepository implements AgreementAdminReadRepository {
    private final JdbcTemplate jdbc;
    private final JdbcW2AgreementRepository agreements;

    public JdbcAgreementAdminReadRepository(JdbcTemplate jdbc, JdbcW2AgreementRepository agreements) {
        this.jdbc = Objects.requireNonNull(jdbc);
        this.agreements = Objects.requireNonNull(agreements);
    }

    @Override
    public SearchPage search(SearchCriteria criteria) {
        StringBuilder predicate = new StringBuilder(" WHERE 1=1");
        List<Object> arguments = new ArrayList<>();
        if (criteria.customerId() != null) {
            predicate.append("""
                     AND EXISTS (
                         SELECT 1 FROM charge_agreement_versions v
                         WHERE v.agreement_id = a.id AND v.customer_id = ?
                     )
                    """);
            arguments.add(criteria.customerId());
        }
        if (criteria.tradeLaneId() != null) {
            predicate.append("""
                     AND EXISTS (
                         SELECT 1 FROM charge_agreement_versions v
                         WHERE v.agreement_id = a.id AND v.trade_lane_id = ?
                     )
                    """);
            arguments.add(criteria.tradeLaneId());
        }
        if (criteria.lifecycle() != null) {
            predicate.append("""
                     AND EXISTS (
                         SELECT 1 FROM charge_agreement_versions v
                         WHERE v.agreement_id = a.id AND v.lifecycle = ?
                     )
                    """);
            arguments.add(criteria.lifecycle().name());
        }
        if (criteria.validOn() != null) {
            predicate.append("""
                     AND EXISTS (
                         SELECT 1 FROM charge_agreement_versions v
                         WHERE v.agreement_id = a.id AND v.valid_from <= ? AND v.valid_to >= ?
                     )
                    """);
            arguments.add(criteria.validOn());
            arguments.add(criteria.validOn());
        }
        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreements a" + predicate,
                Long.class,
                arguments.toArray());
        List<Object> paged = new ArrayList<>(arguments);
        paged.add(criteria.offset());
        paged.add(criteria.limit());
        List<Agreement> values = jdbc.query(
                "SELECT a.id FROM charge_agreements a" + predicate
                        + " ORDER BY a.agreement_number, a.id OFFSET ? LIMIT ?",
                (resultSet, rowNumber) ->
                        agreements.loadAny(new AgreementId(resultSet.getString("id"))),
                paged.toArray());
        return new SearchPage(values, total == null ? 0 : total);
    }

    @Override
    public Optional<Agreement> findById(AgreementId agreementId) {
        try {
            return Optional.of(agreements.loadAny(agreementId));
        } catch (com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepositoryException exception) {
            if ("AGREEMENT_NOT_FOUND".equals(exception.code())) {
                return Optional.empty();
            }
            throw exception;
        }
    }

    @Override
    public List<AgreementActivity> activity(AgreementId agreementId) {
        return jdbc.query("""
                SELECT activity_id, agreement_version_id, action, actor_subject_id,
                       occurred_at, correlation_id, reason, resulting_row_version
                FROM charge_agreement_activity
                WHERE agreement_id = ? AND agreement_version_id IS NOT NULL
                ORDER BY occurred_at, activity_id
                """,
                (resultSet, rowNumber) -> new AgreementActivity(
                        resultSet.getString("activity_id"),
                        agreementId,
                        new AgreementVersionId(resultSet.getString("agreement_version_id")),
                        AgreementActivityAction.valueOf(resultSet.getString("action")),
                        resultSet.getString("actor_subject_id"),
                        resultSet.getTimestamp("occurred_at").toInstant(),
                        resultSet.getString("correlation_id"),
                        resultSet.getString("reason"),
                        resultSet.getLong("resulting_row_version")),
                agreementId.value());
    }
}
