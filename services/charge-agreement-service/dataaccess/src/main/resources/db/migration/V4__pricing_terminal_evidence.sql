ALTER TABLE manual_pricing_cases
    ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN booking_ref VARCHAR(128),
    ADD COLUMN amendment_seq INTEGER,
    ADD COLUMN request_hash VARCHAR(64),
    ADD COLUMN dedupe_key VARCHAR(512);
ALTER TABLE manual_pricing_cases
    ADD CONSTRAINT ck_manual_pricing_case_status CHECK (status = 'OPEN'),
    ADD CONSTRAINT ck_manual_pricing_case_amendment CHECK (amendment_seq IS NULL OR amendment_seq >= 0),
    ADD CONSTRAINT ck_manual_pricing_case_hash CHECK (
        request_hash IS NULL OR request_hash ~ '^[0-9a-f]{64}$'
    );

UPDATE manual_pricing_cases
SET dedupe_key = 'legacy:' || case_id;

WITH ranked AS (
    SELECT case_id, pricing_request_id, reason_code,
           ROW_NUMBER() OVER (
               PARTITION BY pricing_request_id, reason_code
               ORDER BY opened_at ASC NULLS LAST, case_id ASC
           ) AS row_number
    FROM manual_pricing_cases
)
UPDATE manual_pricing_cases target
SET dedupe_key = 'manual:v1|'
    || char_length(ranked.pricing_request_id) || ':' || ranked.pricing_request_id || '|'
    || char_length(ranked.reason_code) || ':' || ranked.reason_code
FROM ranked
WHERE target.case_id = ranked.case_id AND ranked.row_number = 1;

ALTER TABLE manual_pricing_cases
    ALTER COLUMN dedupe_key SET NOT NULL,
    ADD CONSTRAINT uq_manual_pricing_cases_dedupe UNIQUE (dedupe_key);
CREATE INDEX idx_manual_cases_status_opened
    ON manual_pricing_cases(status, opened_at, case_id);
CREATE INDEX idx_manual_cases_booking
    ON manual_pricing_cases(booking_ref, amendment_seq, opened_at)
    WHERE booking_ref IS NOT NULL;
CREATE INDEX idx_manual_cases_request_reason
    ON manual_pricing_cases(pricing_request_id, reason_code, opened_at, case_id);

ALTER TABLE pricing_requests
    ADD COLUMN terminal_http_status INTEGER,
    ADD COLUMN terminal_schema_version VARCHAR(64),
    ADD COLUMN terminal_pricing_request_id VARCHAR(128),
    ADD COLUMN manual_case_id VARCHAR(64);
ALTER TABLE pricing_requests
    ADD CONSTRAINT fk_pricing_requests_manual_case FOREIGN KEY (manual_case_id)
        REFERENCES manual_pricing_cases(case_id) ON DELETE RESTRICT,
    ADD CONSTRAINT ck_pricing_requests_terminal_status CHECK (
        terminal_http_status IS NULL OR terminal_http_status BETWEEN 100 AND 599
    ),
    ADD CONSTRAINT ck_pricing_requests_terminal_shape CHECK (
        terminal_schema_version IS NULL OR (
            terminal_schema_version = 'pricing.v1'
            AND terminal_http_status IS NOT NULL
            AND terminal_pricing_request_id IS NOT NULL
            AND terminal_code IS NOT NULL
            AND completed_at IS NOT NULL
            AND (
                (
                    status = 'COMPLETED' AND terminal_code = 'PRICED'
                    AND terminal_http_status = 200 AND manual_case_id IS NULL
                ) OR (
                    status = 'MANUAL' AND terminal_code <> 'PRICED'
                    AND terminal_http_status IN (404, 422) AND manual_case_id IS NOT NULL
                )
            )
        )
    );
CREATE UNIQUE INDEX uq_pricing_requests_terminal_request
    ON pricing_requests(terminal_pricing_request_id)
    WHERE terminal_pricing_request_id IS NOT NULL;
CREATE INDEX idx_pricing_requests_manual_case
    ON pricing_requests(manual_case_id)
    WHERE manual_case_id IS NOT NULL;
