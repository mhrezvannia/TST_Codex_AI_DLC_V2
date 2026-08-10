ALTER TABLE booking_records ADD COLUMN IF NOT EXISTS equipment_type_code VARCHAR(32);
ALTER TABLE booking_records ADD COLUMN IF NOT EXISTS snapshot_version INTEGER NOT NULL DEFAULT 1;
UPDATE booking_records SET snapshot_version = 1 WHERE snapshot_version IS NULL;
CREATE INDEX IF NOT EXISTS idx_booking_records_updated_id ON booking_records(updated_at DESC, booking_id DESC);
CREATE INDEX IF NOT EXISTS idx_booking_records_status_updated ON booking_records(status, updated_at DESC, booking_id DESC);

ALTER TABLE booking_idempotency DROP CONSTRAINT IF EXISTS booking_idempotency_booking_id_fkey;
ALTER TABLE booking_idempotency ADD COLUMN IF NOT EXISTS operation VARCHAR(32) NOT NULL DEFAULT 'CREATE';
ALTER TABLE booking_idempotency ADD COLUMN IF NOT EXISTS request_hash VARCHAR(64) NOT NULL DEFAULT 'LEGACY_UNKNOWN';
ALTER TABLE booking_idempotency ADD COLUMN IF NOT EXISTS state VARCHAR(32) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE booking_idempotency ADD COLUMN IF NOT EXISTS response_revision INTEGER;
ALTER TABLE booking_idempotency ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'booking_idempotency_booking_id_fkey'
          AND conrelid = 'booking_idempotency'::regclass
    ) THEN
        ALTER TABLE booking_idempotency
            ADD CONSTRAINT booking_idempotency_booking_id_fkey
            FOREIGN KEY (booking_id) REFERENCES booking_records(booking_id)
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;
UPDATE booking_idempotency
SET operation = 'CREATE', request_hash = 'LEGACY_UNKNOWN', state = 'COMPLETED', updated_at = created_at
WHERE request_hash = 'LEGACY_UNKNOWN';

CREATE TABLE IF NOT EXISTS booking_snapshot_migration (
    booking_id VARCHAR(64) PRIMARY KEY,
    from_version INTEGER NOT NULL,
    to_version INTEGER NOT NULL,
    outcome VARCHAR(32) NOT NULL,
    reason VARCHAR(256),
    migrated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_consumed_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(128) NOT NULL,
    source VARCHAR(128) NOT NULL,
    data_schema_version INTEGER NOT NULL,
    booking_ref VARCHAR(64) NOT NULL,
    container_ref VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    consumed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disposition VARCHAR(32)
);

CREATE INDEX IF NOT EXISTS idx_booking_consumed_events_booking
    ON booking_consumed_events(booking_ref, consumed_at DESC);

CREATE TABLE IF NOT EXISTS booking_movement_status (
    booking_ref VARCHAR(64) NOT NULL,
    container_ref VARCHAR(64) NOT NULL,
    movement_id VARCHAR(128),
    move_code VARCHAR(32) NOT NULL,
    event_classifier_code VARCHAR(8) NOT NULL,
    classifier_rank INTEGER NOT NULL,
    occurred_date_time TIMESTAMP NOT NULL,
    received_date_time TIMESTAMP NOT NULL,
    derived_status VARCHAR(64) NOT NULL,
    empty_indicator_code VARCHAR(16) NOT NULL,
    transshipment BOOLEAN NOT NULL,
    location_unlocode VARCHAR(5),
    facility_code VARCHAR(32),
    facility_type_code VARCHAR(32),
    event_id VARCHAR(128) NOT NULL,
    source VARCHAR(128) NOT NULL,
    event_time TIMESTAMP NOT NULL,
    data_schema_version INTEGER NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    projected_at TIMESTAMP NOT NULL,
    PRIMARY KEY (booking_ref, container_ref)
);

CREATE INDEX IF NOT EXISTS idx_booking_movement_status_booking
    ON booking_movement_status(booking_ref, occurred_date_time DESC, event_id DESC);
