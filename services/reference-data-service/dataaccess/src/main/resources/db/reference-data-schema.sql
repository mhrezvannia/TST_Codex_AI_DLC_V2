CREATE TABLE IF NOT EXISTS reference_records (
    reference_set VARCHAR(64) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    code VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    version BIGINT NOT NULL,
    updated_at TIMESTAMP,
    snapshot TEXT NOT NULL,
    PRIMARY KEY (reference_set, record_id)
);

CREATE INDEX IF NOT EXISTS idx_reference_records_set_status
    ON reference_records(reference_set, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reference_records_active_code
    ON reference_records(reference_set, code)
    WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS reference_changes (
    change_id VARCHAR(64) PRIMARY KEY,
    reference_set VARCHAR(64) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    operation VARCHAR(64) NOT NULL,
    changed_at TIMESTAMP,
    correlation_id VARCHAR(128),
    snapshot TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reference_changes_record
    ON reference_changes(reference_set, record_id, changed_at);

CREATE TABLE IF NOT EXISTS reference_outbox (
    event_id VARCHAR(64) PRIMARY KEY,
    reference_set VARCHAR(64) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    operation VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    attempt_count INTEGER NOT NULL,
    next_attempt_at TIMESTAMP,
    claimed_by VARCHAR(128),
    claimed_at TIMESTAMP,
    occurred_at TIMESTAMP,
    correlation_id VARCHAR(128),
    snapshot TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reference_outbox_claim
    ON reference_outbox(status, next_attempt_at, occurred_at);

CREATE INDEX IF NOT EXISTS idx_reference_outbox_status
    ON reference_outbox(reference_set, record_id, status, occurred_at);
