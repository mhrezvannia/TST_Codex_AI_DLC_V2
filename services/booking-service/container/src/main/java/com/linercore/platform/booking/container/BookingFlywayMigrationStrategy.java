package com.linercore.platform.booking.container;

import java.util.Set;
import java.util.TreeSet;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.jdbc.core.JdbcTemplate;

final class BookingFlywayMigrationStrategy implements FlywayMigrationStrategy {
    private static final Set<String> V1_COLUMNS = Set.of(
            "booking_records|booking_id|character varying|NO",
            "booking_records|booking_number|character varying|NO",
            "booking_records|status|character varying|NO",
            "booking_records|revision|integer|NO",
            "booking_records|customer_id|character varying|NO",
            "booking_records|origin_location_id|character varying|NO",
            "booking_records|destination_location_id|character varying|NO",
            "booking_records|updated_at|timestamp without time zone|NO",
            "booking_records|snapshot|text|NO",
            "booking_idempotency|idempotency_key|character varying|NO",
            "booking_idempotency|booking_id|character varying|NO",
            "booking_idempotency|created_at|timestamp without time zone|NO",
            "booking_audit|audit_id|bigint|NO",
            "booking_audit|event_type|character varying|NO",
            "booking_audit|booking_id|character varying|YES",
            "booking_audit|actor_subject_id|character varying|YES",
            "booking_audit|result|character varying|NO",
            "booking_audit|reason|character varying|YES",
            "booking_audit|correlation_id|character varying|YES",
            "booking_audit|created_at|timestamp without time zone|NO",
            "booking_outbox|event_id|character varying|NO",
            "booking_outbox|event_type|character varying|NO",
            "booking_outbox|booking_id|character varying|NO",
            "booking_outbox|booking_number|character varying|NO",
            "booking_outbox|revision|integer|NO",
            "booking_outbox|schema_subject|character varying|NO",
            "booking_outbox|producer_identity|character varying|NO",
            "booking_outbox|deduplication_key|character varying|NO",
            "booking_outbox|correlation_id|character varying|YES",
            "booking_outbox|occurred_at|timestamp without time zone|YES",
            "booking_outbox|status|character varying|NO",
            "booking_outbox|attempt_count|integer|NO",
            "booking_outbox|next_attempt_at|timestamp without time zone|YES",
            "booking_outbox|claimed_by|character varying|YES",
            "booking_outbox|claimed_at|timestamp without time zone|YES",
            "booking_outbox|last_error_code|character varying|YES",
            "booking_outbox|last_error_message|character varying|YES",
            "booking_outbox|snapshot|text|NO");

    private static final Set<String> V1_CONSTRAINTS = Set.of(
            "booking_records|PRIMARY KEY|booking_id",
            "booking_idempotency|PRIMARY KEY|idempotency_key",
            "booking_idempotency|FOREIGN KEY|booking_id",
            "booking_audit|PRIMARY KEY|audit_id",
            "booking_outbox|PRIMARY KEY|event_id");

    private static final Set<String> V1_INDEXES = Set.of(
            "booking_records_pkey",
            "idx_booking_records_booking_number",
            "idx_booking_records_customer_status",
            "booking_idempotency_pkey",
            "booking_audit_pkey",
            "idx_booking_audit_booking",
            "booking_outbox_pkey",
            "idx_booking_outbox_booking",
            "idx_booking_outbox_claim");

    private static final Set<String> V1_DEFAULTS = Set.of(
            "booking_idempotency|created_at|CURRENT_TIMESTAMP|<null>",
            "booking_audit|audit_id|<null>|BY DEFAULT",
            "booking_audit|created_at|CURRENT_TIMESTAMP|<null>",
            "booking_outbox|status|'PENDING'::character varying|<null>",
            "booking_outbox|attempt_count|0|<null>");

    private final JdbcTemplate jdbc;

    BookingFlywayMigrationStrategy(DataSource dataSource) {
        this.jdbc = new JdbcTemplate(dataSource);
    }

    @Override
    public void migrate(Flyway flyway) {
        Set<String> tables = new TreeSet<>(jdbc.queryForList("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
                """, String.class));
        if (tables.contains("flyway_schema_history")) {
            flyway.migrate();
            return;
        }
        if (tables.isEmpty()) {
            flyway.migrate();
            return;
        }
        String mismatch = v1Mismatch(tables);
        if (mismatch != null) {
            throw new IllegalStateException(
                    "Booking schema is non-empty but does not match the exact V1 catalog: " + mismatch);
        }
        flyway.baseline();
        flyway.migrate();
    }

    private String v1Mismatch(Set<String> tables) {
        if (!tables.equals(Set.of("booking_records", "booking_idempotency", "booking_audit", "booking_outbox"))) {
            return "tables";
        }
        Set<String> columns = new TreeSet<>(jdbc.queryForList("""
                SELECT table_name || '|' || column_name || '|' || data_type || '|' || is_nullable
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                """, String.class));
        if (!columns.equals(V1_COLUMNS)) {
            return "columns";
        }
        Set<String> constraints = new TreeSet<>(jdbc.queryForList("""
                SELECT tc.table_name || '|' || tc.constraint_type || '|' ||
                       string_agg(kcu.column_name, ',' ORDER BY kcu.ordinal_position)
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_schema = kcu.constraint_schema
                 AND tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_schema = current_schema()
                  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
                GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
                """, String.class));
        if (!constraints.equals(V1_CONSTRAINTS)) {
            return "constraints";
        }
        Set<String> indexes = new TreeSet<>(jdbc.queryForList("""
                SELECT indexname FROM pg_indexes WHERE schemaname = current_schema()
                """, String.class));
        if (!indexes.equals(V1_INDEXES)) {
            return "indexes";
        }
        Set<String> defaults = new TreeSet<>(jdbc.queryForList("""
                SELECT table_name || '|' || column_name || '|' ||
                       COALESCE(column_default, '<null>') || '|' ||
                       COALESCE(identity_generation, '<null>')
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND ((table_name = 'booking_idempotency' AND column_name = 'created_at')
                    OR (table_name = 'booking_audit' AND column_name IN ('audit_id', 'created_at'))
                    OR (table_name = 'booking_outbox' AND column_name IN ('status', 'attempt_count')))
                """, String.class));
        return defaults.equals(V1_DEFAULTS) ? null : "defaults";
    }
}
