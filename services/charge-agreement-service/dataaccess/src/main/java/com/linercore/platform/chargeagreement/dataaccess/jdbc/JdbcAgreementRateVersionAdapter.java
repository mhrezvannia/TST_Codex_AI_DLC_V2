package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateVersionPort;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import java.util.List;
import java.util.Objects;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

/**
 * Loads the exact supplied RateVersion identities in one bounded set query.
 * Commercial compatibility remains an application policy so it is re-used
 * during the post-lock approval revalidation.
 */
public final class JdbcAgreementRateVersionAdapter implements AgreementRateVersionPort {
    private static final int REQUIRED_LINK_COUNT = 3;

    private final NamedParameterJdbcTemplate jdbc;

    public JdbcAgreementRateVersionAdapter(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = Objects.requireNonNull(jdbc);
    }

    @Override
    public List<RateVersionFact> findExact(List<String> rateVersionIds) {
        if (rateVersionIds == null
                || rateVersionIds.size() != REQUIRED_LINK_COUNT
                || rateVersionIds.stream().anyMatch(value -> value == null || value.isBlank())
                || rateVersionIds.stream().distinct().count() != REQUIRED_LINK_COUNT) {
            return List.of();
        }
        return jdbc.query("""
                SELECT rv.version_id,
                       r.category,
                       r.charge_code,
                       rv.lifecycle,
                       rv.effective_from,
                       rv.effective_to,
                       rv.origin_location_id,
                       rv.destination_location_id,
                       rv.equipment_type_id
                FROM charge_rate_versions rv
                JOIN charge_rates r ON r.rate_id = rv.rate_id
                WHERE rv.version_id IN (:versionIds)
                ORDER BY rv.version_id
                """,
                new MapSqlParameterSource("versionIds", List.copyOf(rateVersionIds)),
                (resultSet, rowNumber) -> new RateVersionFact(
                        resultSet.getString("version_id"),
                        RateCategory.valueOf(resultSet.getString("category")),
                        resultSet.getString("charge_code"),
                        RateLifecycle.valueOf(resultSet.getString("lifecycle")),
                        resultSet.getDate("effective_from").toLocalDate(),
                        resultSet.getDate("effective_to").toLocalDate(),
                        resultSet.getString("origin_location_id"),
                        resultSet.getString("destination_location_id"),
                        resultSet.getString("equipment_type_id")));
    }
}
