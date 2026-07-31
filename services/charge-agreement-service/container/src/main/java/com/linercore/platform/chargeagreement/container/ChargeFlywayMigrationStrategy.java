package com.linercore.platform.chargeagreement.container;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

final class ChargeFlywayMigrationStrategy implements FlywayMigrationStrategy {
    private static final String V1_RESOURCE = "db/migration/V1__charge_baseline.sql";

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;

    ChargeFlywayMigrationStrategy(DataSource dataSource) {
        this.dataSource = dataSource;
        this.jdbc = new JdbcTemplate(dataSource);
    }

    @Override
    public void migrate(Flyway flyway) {
        Set<String> tables = new TreeSet<>(jdbc.queryForList("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
                """, String.class));
        if (tables.contains("flyway_schema_history")) {
            flyway.validate();
            flyway.migrate();
            return;
        }
        if (tables.isEmpty()) {
            flyway.migrate();
            return;
        }
        if (!matchesExactV1Catalog()) {
            throw new IllegalStateException(
                    "Charge schema is non-empty but does not match the exact V1 PostgreSQL catalog");
        }
        flyway.baseline();
        flyway.migrate();
    }

    private boolean matchesExactV1Catalog() {
        String currentSchema = jdbc.queryForObject("SELECT current_schema()", String.class);
        String probeSchema = "charge_v1_probe_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + quoteIdentifier(probeSchema));
        try {
            populateProbeSchema(probeSchema);
            return catalogFingerprint(currentSchema).equals(catalogFingerprint(probeSchema));
        } finally {
            jdbc.execute("DROP SCHEMA IF EXISTS " + quoteIdentifier(probeSchema) + " CASCADE");
        }
    }

    private void populateProbeSchema(String probeSchema) {
        ResourceDatabasePopulator populator =
                new ResourceDatabasePopulator(new ClassPathResource(V1_RESOURCE));
        try (Connection connection = dataSource.getConnection()) {
            connection.setSchema(probeSchema);
            populator.populate(connection);
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not construct the Charge V1 catalog probe", exception);
        }
    }

    private Set<String> catalogFingerprint(String schema) {
        Set<String> fingerprint = new TreeSet<>();
        for (String query : List.of(TABLES_QUERY, COLUMNS_QUERY, CONSTRAINTS_QUERY, INDEXES_QUERY, SEQUENCES_QUERY)) {
            fingerprint.addAll(jdbc.queryForList(query, String.class, schema));
        }
        return fingerprint;
    }

    private static String quoteIdentifier(String identifier) {
        if (!identifier.matches("[a-z0-9_]+")) {
            throw new IllegalArgumentException("Unsafe PostgreSQL identifier");
        }
        return '"' + identifier + '"';
    }

    private static final String TABLES_QUERY = """
            SELECT concat_ws('|', 'T', table_name)
            FROM information_schema.tables
            WHERE table_schema = ? AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """;

    private static final String COLUMNS_QUERY = """
            SELECT concat_ws('|', 'C', table_name, ordinal_position::text, column_name, data_type, udt_name,
                COALESCE(character_maximum_length::text, ''), COALESCE(numeric_precision::text, ''),
                COALESCE(numeric_scale::text, ''), is_nullable, COALESCE(column_default, ''),
                is_identity, COALESCE(identity_generation, ''))
            FROM information_schema.columns
            WHERE table_schema = ?
            ORDER BY table_name, ordinal_position
            """;

    private static final String CONSTRAINTS_QUERY = """
            SELECT concat_ws('|', 'K', relation.relname, constraint_row.conname, constraint_row.contype::text,
                COALESCE((
                    SELECT string_agg(attribute.attname, ',' ORDER BY key_column.ordinality)
                    FROM unnest(constraint_row.conkey) WITH ORDINALITY key_column(attnum, ordinality)
                    JOIN pg_attribute attribute
                      ON attribute.attrelid = constraint_row.conrelid
                     AND attribute.attnum = key_column.attnum
                ), ''),
                COALESCE(referenced_relation.relname, ''),
                COALESCE((
                    SELECT string_agg(attribute.attname, ',' ORDER BY key_column.ordinality)
                    FROM unnest(constraint_row.confkey) WITH ORDINALITY key_column(attnum, ordinality)
                    JOIN pg_attribute attribute
                      ON attribute.attrelid = constraint_row.confrelid
                     AND attribute.attnum = key_column.attnum
                ), ''),
                constraint_row.confupdtype::text, constraint_row.confdeltype::text,
                constraint_row.confmatchtype::text, constraint_row.condeferrable::text,
                constraint_row.condeferred::text, constraint_row.convalidated::text,
                COALESCE(pg_get_expr(constraint_row.conbin, constraint_row.conrelid), ''))
            FROM pg_constraint constraint_row
            JOIN pg_class relation ON relation.oid = constraint_row.conrelid
            JOIN pg_namespace namespace_row ON namespace_row.oid = relation.relnamespace
            LEFT JOIN pg_class referenced_relation ON referenced_relation.oid = constraint_row.confrelid
            WHERE namespace_row.nspname = ?
            ORDER BY relation.relname, constraint_row.conname
            """;

    private static final String INDEXES_QUERY = """
            SELECT concat_ws('|', 'I', relation.relname, index_relation.relname, index_row.indisunique::text,
                index_row.indisprimary::text, access_method.amname, index_row.indnkeyatts::text,
                index_row.indnatts::text,
                COALESCE((
                    SELECT string_agg(COALESCE(attribute.attname, '#expression'), ',' ORDER BY key_column.ordinality)
                    FROM unnest(index_row.indkey) WITH ORDINALITY key_column(attnum, ordinality)
                    LEFT JOIN pg_attribute attribute
                      ON attribute.attrelid = index_row.indrelid
                     AND attribute.attnum = key_column.attnum
                ), ''),
                COALESCE(pg_get_expr(index_row.indexprs, index_row.indrelid), ''),
                COALESCE(pg_get_expr(index_row.indpred, index_row.indrelid), ''))
            FROM pg_index index_row
            JOIN pg_class relation ON relation.oid = index_row.indrelid
            JOIN pg_namespace namespace_row ON namespace_row.oid = relation.relnamespace
            JOIN pg_class index_relation ON index_relation.oid = index_row.indexrelid
            JOIN pg_am access_method ON access_method.oid = index_relation.relam
            WHERE namespace_row.nspname = ?
            ORDER BY relation.relname, index_relation.relname
            """;

    private static final String SEQUENCES_QUERY = """
            SELECT concat_ws('|', 'S', sequence_name, data_type, start_value, minimum_value, maximum_value,
                increment, cycle_option)
            FROM information_schema.sequences
            WHERE sequence_schema = ?
            ORDER BY sequence_name
            """;
}
