package com.linercore.platform.chargeagreement.container;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class ChargeFlywayMigrationStrategyPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("charge_adoption");

    @BeforeEach
    void resetSchema() throws Exception {
        execute("DROP SCHEMA public CASCADE");
        execute("CREATE SCHEMA public");
    }

    @Test
    void exactV1CatalogIsBaselinedAndMigratedToV4() throws Exception {
        installUnmanagedV1();

        new ChargeFlywayMigrationStrategy(dataSource()).migrate(fullFlyway());

        assertEquals(1, scalar("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'charge_rate_versions'
                """));
        assertEquals(4, scalar("SELECT COUNT(*) FROM flyway_schema_history WHERE success"));
    }

    @Test
    void sameColumnsWithDriftedTypeAreRejectedBeforeBaseline() throws Exception {
        installUnmanagedV1();
        execute("ALTER TABLE charge_agreements ALTER COLUMN agreement_number TYPE VARCHAR(65)");

        assertDriftRejected();
    }

    @Test
    void sameColumnsWithMissingConstraintAreRejectedBeforeBaseline() throws Exception {
        installUnmanagedV1();
        execute("ALTER TABLE charge_agreement_terms DROP CONSTRAINT charge_agreement_terms_pkey");

        assertDriftRejected();
    }

    @Test
    void sameColumnsWithMissingIndexAreRejectedBeforeBaseline() throws Exception {
        installUnmanagedV1();
        execute("DROP INDEX idx_pricing_requests_status_lease");

        assertDriftRejected();
    }

    private void assertDriftRejected() throws Exception {
        assertThrows(IllegalStateException.class,
                () -> new ChargeFlywayMigrationStrategy(dataSource()).migrate(fullFlyway()));
        assertEquals(0, scalar("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'flyway_schema_history'
                """));
        assertEquals(0, scalar("""
                SELECT COUNT(*) FROM information_schema.schemata
                WHERE schema_name LIKE 'charge_v1_probe_%'
                """));
    }

    private void installUnmanagedV1() throws Exception {
        Flyway.configure()
                .dataSource(dataSource())
                .locations("classpath:db/migration")
                .target("1")
                .load()
                .migrate();
        execute("DROP TABLE flyway_schema_history");
    }

    private Flyway fullFlyway() {
        return Flyway.configure()
                .dataSource(dataSource())
                .locations("classpath:db/migration")
                .baselineVersion("1")
                .validateOnMigrate(true)
                .load();
    }

    private DataSource dataSource() {
        return new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private void execute(String sql) throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private int scalar(String sql) throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement();
                var result = statement.executeQuery(sql)) {
            result.next();
            return result.getInt(1);
        }
    }

    private Connection connection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }
}
