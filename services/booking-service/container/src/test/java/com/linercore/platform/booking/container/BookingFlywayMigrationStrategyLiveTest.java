package com.linercore.platform.booking.container;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

class BookingFlywayMigrationStrategyLiveTest {
    private static final String URL_PROPERTY = "booking.integration.jdbc-url";
    private static final String USER_PROPERTY = "booking.integration.username";
    private static final String PASSWORD_PROPERTY = "booking.integration.password";

    private DataSource adminDataSource;
    private String schema;

    @BeforeEach
    void createIsolatedSchema() {
        String url = integrationUrl();
        String username = System.getProperty(USER_PROPERTY, "linercore_booking");
        String password = System.getProperty(PASSWORD_PROPERTY, "booking_local");
        adminDataSource = new DriverManagerDataSource(url, username, password);
        try (var connection = adminDataSource.getConnection()) {
            Assumptions.assumeTrue(connection.isValid(2), "PostgreSQL migration test database is unavailable");
        } catch (Exception exception) {
            Assumptions.assumeTrue(false,
                    () -> "PostgreSQL migration test database is unavailable: " + exception.getMessage());
        }
        schema = "booking_migration_" + UUID.randomUUID().toString().replace("-", "");
        new JdbcTemplate(adminDataSource).execute("CREATE SCHEMA " + schema);
    }

    @AfterEach
    void dropIsolatedSchema() {
        if (adminDataSource != null && schema != null) {
            new JdbcTemplate(adminDataSource).execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
        }
    }

    @Test
    void migratesEmptySchemaAndIsStableAcrossRestart() {
        DataSource schemaDataSource = schemaDataSource();
        Flyway flyway = flyway(schemaDataSource);
        BookingFlywayMigrationStrategy strategy = new BookingFlywayMigrationStrategy(schemaDataSource);

        strategy.migrate(flyway);
        List<HistoryRow> firstHistory = history(schemaDataSource);
        strategy.migrate(flyway(schemaDataSource));

        assertThat(firstHistory).extracting(HistoryRow::version).containsExactly("1", "2", "3");
        assertThat(history(schemaDataSource)).isEqualTo(firstHistory);
        assertThat(columns(schemaDataSource, "booking_records"))
                .contains("equipment_type_code", "snapshot_version");
        assertThat(columns(schemaDataSource, "booking_idempotency"))
                .contains(
                        "operation",
                        "request_hash",
                        "state",
                        "response_revision",
                        "provider_key",
                        "response_snapshot",
                        "updated_at");
        assertThat(columns(schemaDataSource, "booking_pricing_snapshots"))
                .contains(
                        "booking_id",
                        "pricing_request_id",
                        "amendment_seq",
                        "booking_revision",
                        "schema_version",
                        "snapshot");
    }

    @Test
    void baselinesOnlyTheExactLegacyCatalogThenMigratesRemainingCatalog() throws Exception {
        DataSource schemaDataSource = schemaDataSource();
        try (var connection = schemaDataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/migration/V1__booking_baseline.sql"));
        }

        new BookingFlywayMigrationStrategy(schemaDataSource).migrate(flyway(schemaDataSource));

        assertThat(history(schemaDataSource)).extracting(HistoryRow::version).containsExactly("1", "2", "3");
        assertThat(columns(schemaDataSource, "booking_snapshot_migration"))
                .contains("booking_id", "from_version", "to_version", "outcome");
        assertThat(columns(schemaDataSource, "booking_pricing_snapshots"))
                .contains("booking_id", "pricing_request_id", "snapshot", "correlation_id");
    }

    @Test
    void rejectsPartialCatalogBeforeFlywayMutatesIt() {
        DataSource schemaDataSource = schemaDataSource();
        JdbcTemplate jdbc = new JdbcTemplate(schemaDataSource);
        jdbc.execute("CREATE TABLE booking_records (booking_id VARCHAR(64) PRIMARY KEY)");

        assertThatThrownBy(() -> new BookingFlywayMigrationStrategy(schemaDataSource)
                        .migrate(flyway(schemaDataSource)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("does not match the exact V1 catalog");
        assertThat(jdbc.queryForList(
                "SELECT table_name FROM information_schema.tables "
                        + "WHERE table_schema = current_schema() ORDER BY table_name",
                String.class))
                .containsExactly("booking_records");
    }

    private DataSource schemaDataSource() {
        String url = integrationUrl();
        String separator = url.contains("?") ? "&" : "?";
        return new DriverManagerDataSource(
                url + separator + "currentSchema=" + schema,
                System.getProperty(USER_PROPERTY, "linercore_booking"),
                System.getProperty(PASSWORD_PROPERTY, "booking_local"));
    }

    private String integrationUrl() {
        return System.getProperty(URL_PROPERTY, "jdbc:postgresql://127.0.0.1:55432/linercore_booking?connectTimeout=2");
    }

    private Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineVersion("1")
                .baselineOnMigrate(false)
                .validateOnMigrate(true)
                .load();
    }

    private List<HistoryRow> history(DataSource dataSource) {
        return new JdbcTemplate(dataSource).query(
                "SELECT version, checksum FROM flyway_schema_history WHERE success ORDER BY installed_rank",
                (resultSet, rowNumber) -> new HistoryRow(
                        resultSet.getString("version"), (Integer) resultSet.getObject("checksum")));
    }

    private List<String> columns(DataSource dataSource, String table) {
        return new JdbcTemplate(dataSource).queryForList(
                "SELECT column_name FROM information_schema.columns "
                        + "WHERE table_schema = current_schema() AND table_name = ? ORDER BY ordinal_position",
                String.class,
                table);
    }

    private record HistoryRow(String version, Integer checksum) {
    }
}
