package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

class JdbcAgreementRateVersionAdapterPostgresTest extends AgreementPostgresSupport {
    @Test
    void loadsOnlyThreeExactSuppliedApprovedRateVersionsInOneSet() {
        JdbcAgreementRateVersionAdapter adapter =
                new JdbcAgreementRateVersionAdapter(new NamedParameterJdbcTemplate(jdbc));

        var facts = adapter.findExact(List.of(
                "rate-version-base", "rate-version-surcharge", "rate-version-local"));

        assertEquals(3, facts.size());
        assertTrue(facts.stream().allMatch(value -> value.lifecycle() == RateLifecycle.APPROVED));
        assertEquals(List.of("OFR", "THC", "BAF"),
                facts.stream().map(value -> value.chargeCode()).sorted().toList());
    }

    @Test
    void rejectsUnboundedDuplicateOrIncompleteIdentitySetsBeforeQuery() {
        JdbcAgreementRateVersionAdapter adapter =
                new JdbcAgreementRateVersionAdapter(new NamedParameterJdbcTemplate(jdbc));

        assertTrue(adapter.findExact(List.of("rate-version-base")).isEmpty());
        assertTrue(adapter.findExact(List.of(
                "rate-version-base", "rate-version-base", "rate-version-local")).isEmpty());
    }
}
