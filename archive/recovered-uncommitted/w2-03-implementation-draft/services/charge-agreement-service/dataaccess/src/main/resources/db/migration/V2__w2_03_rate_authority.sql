CREATE TABLE IF NOT EXISTS charge_rate_versions (
    rate_version_id VARCHAR(64) PRIMARY KEY,
    definition_id VARCHAR(64) NOT NULL,
    version_number INTEGER NOT NULL,
    category VARCHAR(32) NOT NULL,
    charge_code_id VARCHAR(64) NOT NULL,
    trade_lane_id VARCHAR(64) NOT NULL,
    equipment_type_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    basis VARCHAR(32) NOT NULL,
    amount DECIMAL(18, 4) NOT NULL CHECK (amount > 0),
    currency_id VARCHAR(3) NOT NULL CHECK (UPPER(currency_id) = 'USD'),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    previous_version_id VARCHAR(64),
    UNIQUE (definition_id, version_number),
    CHECK (valid_to >= valid_from),
    CHECK ((category = 'LOCAL' AND location_id IS NOT NULL) OR (category <> 'LOCAL' AND location_id IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_charge_rate_match
    ON charge_rate_versions(status, category, trade_lane_id, equipment_type_id, valid_from, valid_to);

CREATE TABLE IF NOT EXISTS charge_agreement_rate_bindings (
    agreement_id VARCHAR(64) NOT NULL REFERENCES charge_agreements(id),
    agreement_version BIGINT NOT NULL,
    rate_version_id VARCHAR(64) NOT NULL REFERENCES charge_rate_versions(rate_version_id),
    PRIMARY KEY (agreement_id, agreement_version, rate_version_id)
);

CREATE INDEX IF NOT EXISTS idx_charge_agreement_rate_binding_version
    ON charge_agreement_rate_bindings(agreement_id, agreement_version);
