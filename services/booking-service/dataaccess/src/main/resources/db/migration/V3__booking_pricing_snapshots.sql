CREATE TABLE booking_pricing_snapshots (
    booking_id VARCHAR(64) NOT NULL,
    pricing_request_id VARCHAR(128) NOT NULL,
    amendment_seq INTEGER NOT NULL,
    booking_revision INTEGER NOT NULL,
    schema_version INTEGER NOT NULL,
    snapshot TEXT NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_booking_pricing_snapshots
        PRIMARY KEY (booking_id, pricing_request_id),
    CONSTRAINT fk_booking_pricing_snapshots_booking
        FOREIGN KEY (booking_id) REFERENCES booking_records(booking_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_booking_pricing_snapshots_amendment
        CHECK (amendment_seq >= 0),
    CONSTRAINT chk_booking_pricing_snapshots_revision
        CHECK (booking_revision >= 0),
    CONSTRAINT chk_booking_pricing_snapshots_schema
        CHECK (schema_version >= 2)
);

CREATE INDEX idx_booking_pricing_snapshots_cursor
    ON booking_pricing_snapshots (
        booking_id,
        amendment_seq DESC,
        created_at DESC,
        pricing_request_id DESC
    );

ALTER TABLE booking_idempotency
    ALTER COLUMN idempotency_key TYPE VARCHAR(192);
ALTER TABLE booking_idempotency
    ADD COLUMN provider_key VARCHAR(160);
ALTER TABLE booking_idempotency
    ADD COLUMN response_http_status INTEGER;
ALTER TABLE booking_idempotency
    ADD COLUMN response_code VARCHAR(64);
ALTER TABLE booking_idempotency
    ADD COLUMN response_snapshot TEXT;
ALTER TABLE booking_idempotency
    ADD COLUMN retry_after_seconds INTEGER;
ALTER TABLE booking_idempotency
    ADD COLUMN correlation_id VARCHAR(128);
ALTER TABLE booking_idempotency
    ADD COLUMN lease_owner VARCHAR(128);
ALTER TABLE booking_idempotency
    ADD COLUMN lease_expires_at TIMESTAMP;
ALTER TABLE booking_idempotency
    ADD COLUMN fence_token BIGINT NOT NULL DEFAULT 0;
ALTER TABLE booking_idempotency
    ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_idempotency
    ADD COLUMN next_attempt_at TIMESTAMP;

ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_http_status
    CHECK (response_http_status IS NULL OR response_http_status BETWEEN 100 AND 599);
ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_retry_after
    CHECK (retry_after_seconds IS NULL OR retry_after_seconds BETWEEN 1 AND 30);
ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_fence
    CHECK (fence_token >= 0);
ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_attempt
    CHECK (attempt_count >= 0);
ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_price_shape
    CHECK (
        operation <> 'PRICE'
        OR (
            request_hash ~ '^[0-9a-f]{64}$'
            AND state IN ('IN_PROGRESS', 'COMPLETED', 'RETRYABLE')
            AND provider_key IS NOT NULL
            AND correlation_id IS NOT NULL
            AND (
                (
                    state = 'IN_PROGRESS'
                    AND lease_owner IS NOT NULL
                    AND lease_expires_at IS NOT NULL
                    AND response_http_status IS NULL
                    AND response_code IS NULL
                    AND response_snapshot IS NULL
                    AND retry_after_seconds IS NULL
                    AND next_attempt_at IS NULL
                )
                OR (
                    state = 'COMPLETED'
                    AND lease_owner IS NULL
                    AND lease_expires_at IS NULL
                    AND response_http_status IS NOT NULL
                    AND response_code IS NOT NULL
                    AND response_snapshot IS NOT NULL
                    AND next_attempt_at IS NULL
                )
                OR (
                    state = 'RETRYABLE'
                    AND lease_owner IS NULL
                    AND lease_expires_at IS NULL
                    AND response_http_status IS NOT NULL
                    AND response_code IS NOT NULL
                    AND response_snapshot IS NOT NULL
                    AND (
                        next_attempt_at IS NOT NULL
                        OR response_code = 'BOOKING_CHANGED'
                    )
                )
            )
        )
    );

CREATE INDEX idx_booking_price_due
    ON booking_idempotency (state, next_attempt_at, idempotency_key)
    WHERE operation = 'PRICE';
