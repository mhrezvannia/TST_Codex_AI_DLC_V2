package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementNumber;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementValidity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
abstract class AgreementPostgresSupport {
    static final Instant NOW = Instant.parse("2026-07-28T08:00:00Z");
    static final LocalDate FROM = LocalDate.parse("2026-08-01");
    static final LocalDate TO = LocalDate.parse("2026-08-31");

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("agreement_authority");

    DriverManagerDataSource dataSource;
    JdbcTemplate jdbc;

    @BeforeEach
    void migrateCleanSchema() throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA public CASCADE");
            statement.execute("CREATE SCHEMA public");
        }
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();
        dataSource = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(dataSource);
        seedRates();
    }

    JdbcW2AgreementRepository repository() {
        return new JdbcW2AgreementRepository(new JdbcTemplate(dataSource));
    }

    TransactionTemplate transactions() {
        return new TransactionTemplate(new DataSourceTransactionManager(dataSource));
    }

    Agreement draft(String suffix) {
        return Agreement.firstDraft(
                new AgreementId("agreement-" + suffix),
                new AgreementNumber("AGR-" + suffix),
                new AgreementVersionId("agreement-version-" + suffix),
                new ReferenceId("customer-1"),
                new ReferenceId("lane-1"),
                new ReferenceId("origin-1"),
                new ReferenceId("destination-1"),
                new ReferenceId("equipment-1"),
                new AgreementValidity(FROM, TO),
                List.of(
                        new AgreementRateLink(RateCategory.BASE, new RateVersionId("rate-version-base")),
                        new AgreementRateLink(RateCategory.SURCHARGE, new RateVersionId("rate-version-surcharge")),
                        new AgreementRateLink(RateCategory.LOCAL, new RateVersionId("rate-version-local"))),
                "pricing-user",
                NOW,
                "corr-" + suffix);
    }

    AgreementActivity activity(
            Agreement stable, AgreementVersion version, String id, AgreementActivityAction action) {
        return new AgreementActivity(
                id, stable.id(), version.id(), action, "pricing-user", NOW,
                "corr-" + id, action == AgreementActivityAction.CREATED ? null : "test reason",
                version.rowVersion());
    }

    private void seedRates() {
        for (RateSeed seed : List.of(
                new RateSeed("base", "BASE", "OFR", "destination-1"),
                new RateSeed("surcharge", "SURCHARGE", "BAF", "destination-1"),
                new RateSeed("local", "LOCAL", "THC", null))) {
            jdbc.update("""
                    INSERT INTO charge_rates (
                        rate_id, category, charge_code_id, charge_code, next_version_no,
                        stable_row_version, created_by, created_at, correlation_id
                    ) VALUES (?, ?, ?, ?, 2, 0, 'pricing-user', ?, 'corr-seed')
                    """, "rate-" + seed.id(), seed.category(), "charge-code-" + seed.code(),
                    seed.code(), java.sql.Timestamp.from(NOW));
            jdbc.update("""
                    INSERT INTO charge_rate_versions (
                        version_id, rate_id, version_no, lifecycle, basis, currency_id,
                        currency_code, unit_rate, effective_from, effective_to,
                        origin_location_id, destination_location_id, equipment_type_id,
                        row_version, created_by, created_at, approved_by, approved_at,
                        correlation_id
                    ) VALUES (?, ?, 1, 'APPROVED', 'PER_CONTAINER', 'currency-usd',
                              'USD', 100.00, ?, ?, 'origin-1', ?, 'equipment-1',
                              1, 'pricing-user', ?, 'approver', ?, 'corr-seed')
                    """, "rate-version-" + seed.id(), "rate-" + seed.id(), FROM.minusDays(1),
                    TO.plusDays(1), seed.destination(), java.sql.Timestamp.from(NOW),
                    java.sql.Timestamp.from(NOW));
        }
    }

    private Connection connection() throws Exception {
        return DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private record RateSeed(String id, String category, String code, String destination) {
    }
}
