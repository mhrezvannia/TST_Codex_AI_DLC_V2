ALTER TABLE charge_agreements
    ADD COLUMN authority_model VARCHAR(16) NOT NULL DEFAULT 'LEGACY';
ALTER TABLE charge_agreements
    ALTER COLUMN commodity_id DROP NOT NULL;
ALTER TABLE charge_agreements
    ADD CONSTRAINT ck_charge_agreements_authority_model
        CHECK (authority_model IN ('LEGACY', 'W2_VERSIONED'));
CREATE INDEX idx_charge_agreements_authority_model
    ON charge_agreements(authority_model, agreement_number, id);

CREATE TABLE charge_agreement_versions (
    agreement_version_id VARCHAR(64) PRIMARY KEY,
    agreement_id VARCHAR(64) NOT NULL,
    version_no BIGINT NOT NULL,
    authority_model VARCHAR(16) NOT NULL,
    w2_authority_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    customer_id VARCHAR(64) NOT NULL,
    trade_lane_id VARCHAR(64) NOT NULL,
    origin_location_id VARCHAR(64),
    destination_location_id VARCHAR(64),
    equipment_type_id VARCHAR(64),
    commodity_id VARCHAR(64),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    lifecycle VARCHAR(32) NOT NULL,
    legacy_status VARCHAR(32),
    row_version BIGINT NOT NULL DEFAULT 0,
    source_version_id VARCHAR(64),
    created_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    approved_by VARCHAR(128),
    approved_at TIMESTAMP,
    correlation_id VARCHAR(128),
    snapshot TEXT NOT NULL,
    CONSTRAINT fk_cav_agreement FOREIGN KEY (agreement_id)
        REFERENCES charge_agreements(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cav_source FOREIGN KEY (source_version_id)
        REFERENCES charge_agreement_versions(agreement_version_id) ON DELETE RESTRICT,
    CONSTRAINT uq_charge_agreement_versions_number UNIQUE (agreement_id, version_no),
    CONSTRAINT ck_cav_model CHECK (authority_model IN ('LEGACY', 'W2_VERSIONED')),
    CONSTRAINT ck_cav_lifecycle CHECK (lifecycle IN ('LEGACY', 'DRAFT', 'APPROVED', 'SUSPENDED', 'EXPIRED')),
    CONSTRAINT ck_cav_dates CHECK (valid_to >= valid_from),
    CONSTRAINT ck_cav_row_version CHECK (row_version >= 0),
    CONSTRAINT ck_cav_shape CHECK (
        (
            authority_model = 'LEGACY' AND lifecycle = 'LEGACY'
            AND w2_authority_eligible = FALSE AND legacy_status IS NOT NULL
            AND origin_location_id IS NULL AND destination_location_id IS NULL
            AND equipment_type_id IS NULL
        ) OR (
            authority_model = 'W2_VERSIONED' AND lifecycle IN ('DRAFT', 'APPROVED', 'SUSPENDED', 'EXPIRED')
            AND w2_authority_eligible = TRUE AND legacy_status IS NULL
            AND origin_location_id IS NOT NULL AND destination_location_id IS NOT NULL
            AND equipment_type_id IS NOT NULL AND version_no > 0
        )
    )
);

CREATE UNIQUE INDEX uq_cav_one_draft_per_agreement
    ON charge_agreement_versions(agreement_id)
    WHERE authority_model = 'W2_VERSIONED' AND lifecycle = 'DRAFT';
CREATE INDEX idx_cav_detail
    ON charge_agreement_versions(agreement_id, version_no DESC);
CREATE INDEX idx_cav_w2_authority
    ON charge_agreement_versions(
        customer_id, trade_lane_id, origin_location_id, destination_location_id,
        equipment_type_id, valid_from, valid_to
    ) WHERE authority_model = 'W2_VERSIONED' AND lifecycle = 'APPROVED';
CREATE INDEX idx_cav_customer_lifecycle_updated
    ON charge_agreement_versions(customer_id, lifecycle, updated_at DESC, agreement_id);
CREATE INDEX idx_cav_source
    ON charge_agreement_versions(source_version_id)
    WHERE source_version_id IS NOT NULL;

CREATE TABLE charge_agreement_rate_links (
    agreement_version_id VARCHAR(64) NOT NULL,
    rate_category VARCHAR(16) NOT NULL,
    rate_version_id VARCHAR(64) NOT NULL,
    linked_by VARCHAR(128) NOT NULL,
    linked_at TIMESTAMP NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    CONSTRAINT pk_charge_agreement_rate_links PRIMARY KEY (agreement_version_id, rate_category),
    CONSTRAINT fk_carl_agreement_version FOREIGN KEY (agreement_version_id)
        REFERENCES charge_agreement_versions(agreement_version_id) ON DELETE RESTRICT,
    CONSTRAINT fk_carl_rate_version FOREIGN KEY (rate_version_id)
        REFERENCES charge_rate_versions(version_id) ON DELETE RESTRICT,
    CONSTRAINT uq_carl_version_rate UNIQUE (agreement_version_id, rate_version_id),
    CONSTRAINT ck_carl_category CHECK (rate_category IN ('BASE', 'SURCHARGE', 'LOCAL'))
);
CREATE INDEX idx_carl_rate_version
    ON charge_agreement_rate_links(rate_version_id, agreement_version_id);

ALTER TABLE charge_agreement_activity
    ADD COLUMN activity_id VARCHAR(64),
    ADD COLUMN agreement_version_id VARCHAR(64),
    ADD COLUMN actor_subject_id VARCHAR(128),
    ADD COLUMN correlation_id VARCHAR(128),
    ADD COLUMN resulting_row_version BIGINT;
CREATE UNIQUE INDEX uq_charge_agreement_activity_v3_id
    ON charge_agreement_activity(activity_id)
    WHERE activity_id IS NOT NULL;
CREATE INDEX idx_caa_version_time
    ON charge_agreement_activity(agreement_version_id, occurred_at, activity_id)
    WHERE agreement_version_id IS NOT NULL;
CREATE INDEX idx_caa_correlation
    ON charge_agreement_activity(correlation_id)
    WHERE correlation_id IS NOT NULL;

INSERT INTO charge_agreement_versions (
    agreement_version_id, agreement_id, version_no, authority_model,
    w2_authority_eligible, customer_id, trade_lane_id, commodity_id,
    valid_from, valid_to, lifecycle, legacy_status, row_version,
    created_by, created_at, updated_by, updated_at, snapshot
)
SELECT
    'av-' || md5(id || ':' || version::text),
    id,
    version,
    'LEGACY',
    FALSE,
    customer_id,
    trade_lane_id,
    commodity_id,
    valid_from,
    valid_to,
    'LEGACY',
    status,
    GREATEST(version, 0),
    COALESCE(NULLIF(created_by, ''), 'legacy-migration'),
    COALESCE(created_at, TIMESTAMP '1970-01-01 00:00:00'),
    updated_by,
    updated_at,
    COALESCE(snapshot, '{}')
FROM charge_agreements
ON CONFLICT (agreement_version_id) DO NOTHING;

DO $$
DECLARE
    header_count BIGINT;
    history_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO header_count FROM charge_agreements WHERE authority_model = 'LEGACY';
    SELECT COUNT(*) INTO history_count FROM charge_agreement_versions WHERE authority_model = 'LEGACY';
    IF header_count <> history_count THEN
        RAISE EXCEPTION 'deterministic agreement history backfill count mismatch';
    END IF;
END $$;
