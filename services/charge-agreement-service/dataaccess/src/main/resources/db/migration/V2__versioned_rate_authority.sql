CREATE TABLE charge_rates (
    rate_id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(16) NOT NULL,
    charge_code_id VARCHAR(64) NOT NULL,
    charge_code VARCHAR(16) NOT NULL,
    next_version_no BIGINT NOT NULL DEFAULT 2,
    stable_row_version BIGINT NOT NULL DEFAULT 0,
    created_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    CONSTRAINT ck_charge_rates_category_code CHECK (
        (category = 'BASE' AND charge_code = 'OFR') OR
        (category = 'SURCHARGE' AND charge_code = 'BAF') OR
        (category = 'LOCAL' AND charge_code = 'THC')
    ),
    CONSTRAINT ck_charge_rates_next_version CHECK (next_version_no > 0),
    CONSTRAINT ck_charge_rates_row_version CHECK (stable_row_version >= 0)
);

CREATE TABLE charge_rate_versions (
    version_id VARCHAR(64) PRIMARY KEY,
    rate_id VARCHAR(64) NOT NULL,
    version_no BIGINT NOT NULL,
    lifecycle VARCHAR(16) NOT NULL,
    basis VARCHAR(32) NOT NULL,
    currency_id VARCHAR(64) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    unit_rate DECIMAL(18, 2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    origin_location_id VARCHAR(64) NOT NULL,
    destination_location_id VARCHAR(64),
    equipment_type_id VARCHAR(64) NOT NULL,
    row_version BIGINT NOT NULL DEFAULT 0,
    source_version_id VARCHAR(64),
    created_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    approved_by VARCHAR(128),
    approved_at TIMESTAMP,
    correlation_id VARCHAR(128) NOT NULL,
    CONSTRAINT fk_charge_rate_versions_rate FOREIGN KEY (rate_id)
        REFERENCES charge_rates(rate_id) ON DELETE RESTRICT,
    CONSTRAINT fk_charge_rate_versions_source FOREIGN KEY (source_version_id)
        REFERENCES charge_rate_versions(version_id) ON DELETE RESTRICT,
    CONSTRAINT uq_charge_rate_versions_number UNIQUE (rate_id, version_no),
    CONSTRAINT ck_charge_rate_versions_number CHECK (version_no > 0),
    CONSTRAINT ck_charge_rate_versions_lifecycle CHECK (lifecycle IN ('DRAFT', 'APPROVED')),
    CONSTRAINT ck_charge_rate_versions_basis CHECK (basis = 'PER_CONTAINER'),
    CONSTRAINT ck_charge_rate_versions_currency CHECK (currency_code = 'USD'),
    CONSTRAINT ck_charge_rate_versions_amount CHECK (unit_rate >= 0 AND scale(unit_rate) <= 2),
    CONSTRAINT ck_charge_rate_versions_window CHECK (effective_to >= effective_from),
    CONSTRAINT ck_charge_rate_versions_row_version CHECK (row_version >= 0)
);

CREATE OR REPLACE FUNCTION enforce_charge_rate_destination()
RETURNS TRIGGER AS $$
DECLARE
    stable_category VARCHAR(16);
BEGIN
    SELECT category INTO stable_category FROM charge_rates WHERE rate_id = NEW.rate_id;
    IF stable_category = 'LOCAL' AND NEW.destination_location_id IS NOT NULL THEN
        RAISE EXCEPTION 'LOCAL destination must be absent' USING ERRCODE = '23514';
    END IF;
    IF stable_category IN ('BASE', 'SURCHARGE') AND NEW.destination_location_id IS NULL THEN
        RAISE EXCEPTION 'lane destination is required' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_charge_rate_versions_destination
    BEFORE INSERT OR UPDATE OF rate_id, destination_location_id
    ON charge_rate_versions
    FOR EACH ROW EXECUTE FUNCTION enforce_charge_rate_destination();

CREATE UNIQUE INDEX uq_charge_rate_versions_one_draft
    ON charge_rate_versions(rate_id)
    WHERE lifecycle = 'DRAFT';
CREATE INDEX idx_charge_rate_versions_history
    ON charge_rate_versions(rate_id, version_no DESC);
CREATE INDEX idx_charge_rate_versions_list
    ON charge_rate_versions(lifecycle, effective_from, effective_to, rate_id, version_no DESC);
CREATE INDEX idx_charge_rate_versions_applicability
    ON charge_rate_versions(origin_location_id, destination_location_id, equipment_type_id, effective_from, effective_to);
CREATE INDEX idx_charge_rate_versions_approved_overlap
    ON charge_rate_versions(rate_id, effective_from, effective_to)
    WHERE lifecycle = 'APPROVED';
CREATE INDEX idx_charge_rates_category_created
    ON charge_rates(category, created_at DESC, rate_id);

CREATE TABLE charge_rate_activity (
    activity_id VARCHAR(64) PRIMARY KEY,
    rate_id VARCHAR(64) NOT NULL,
    version_id VARCHAR(64) NOT NULL,
    version_no BIGINT NOT NULL,
    action VARCHAR(32) NOT NULL,
    actor_subject_id VARCHAR(128) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    reason VARCHAR(512),
    resulting_row_version BIGINT NOT NULL,
    CONSTRAINT fk_charge_rate_activity_rate FOREIGN KEY (rate_id)
        REFERENCES charge_rates(rate_id) ON DELETE RESTRICT,
    CONSTRAINT fk_charge_rate_activity_version FOREIGN KEY (version_id)
        REFERENCES charge_rate_versions(version_id) ON DELETE RESTRICT,
    CONSTRAINT ck_charge_rate_activity_action CHECK (
        action IN ('RATE_CREATED', 'RATE_DRAFT_UPDATED', 'RATE_SUCCESSOR_CREATED', 'RATE_VERSION_APPROVED')
    ),
    CONSTRAINT ck_charge_rate_activity_version CHECK (version_no > 0 AND resulting_row_version >= 0)
);

CREATE INDEX idx_charge_rate_activity_history
    ON charge_rate_activity(rate_id, version_no DESC, occurred_at, activity_id);
CREATE INDEX idx_charge_rate_activity_correlation
    ON charge_rate_activity(correlation_id);
