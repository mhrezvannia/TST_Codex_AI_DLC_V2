CREATE OR REPLACE FUNCTION protect_approved_charge_rate_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' OR OLD.lifecycle = 'APPROVED' THEN
        RAISE EXCEPTION 'approved charge rate versions are immutable'
            USING ERRCODE = '55000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_charge_rate_versions_approved_immutable
    BEFORE UPDATE OR DELETE
    ON charge_rate_versions
    FOR EACH ROW EXECUTE FUNCTION protect_approved_charge_rate_version();

CREATE OR REPLACE FUNCTION protect_approved_charge_agreement_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.lifecycle IN ('APPROVED', 'SUSPENDED', 'EXPIRED') THEN
            RAISE EXCEPTION 'approved charge agreement versions are immutable'
                USING ERRCODE = '55000';
        END IF;
        RETURN OLD;
    END IF;

    IF OLD.lifecycle = 'APPROVED' THEN
        IF NEW.lifecycle NOT IN ('SUSPENDED', 'EXPIRED')
            OR NEW.agreement_version_id IS DISTINCT FROM OLD.agreement_version_id
            OR NEW.agreement_id IS DISTINCT FROM OLD.agreement_id
            OR NEW.version_no IS DISTINCT FROM OLD.version_no
            OR NEW.authority_model IS DISTINCT FROM OLD.authority_model
            OR NEW.w2_authority_eligible IS DISTINCT FROM OLD.w2_authority_eligible
            OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
            OR NEW.trade_lane_id IS DISTINCT FROM OLD.trade_lane_id
            OR NEW.origin_location_id IS DISTINCT FROM OLD.origin_location_id
            OR NEW.destination_location_id IS DISTINCT FROM OLD.destination_location_id
            OR NEW.equipment_type_id IS DISTINCT FROM OLD.equipment_type_id
            OR NEW.commodity_id IS DISTINCT FROM OLD.commodity_id
            OR NEW.valid_from IS DISTINCT FROM OLD.valid_from
            OR NEW.valid_to IS DISTINCT FROM OLD.valid_to
            OR NEW.legacy_status IS DISTINCT FROM OLD.legacy_status
            OR NEW.source_version_id IS DISTINCT FROM OLD.source_version_id
            OR NEW.created_by IS DISTINCT FROM OLD.created_by
            OR NEW.created_at IS DISTINCT FROM OLD.created_at
            OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
            OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
            OR NEW.snapshot IS DISTINCT FROM OLD.snapshot THEN
            RAISE EXCEPTION 'approved charge agreement authority fields are immutable'
                USING ERRCODE = '55000';
        END IF;
    ELSIF OLD.lifecycle IN ('SUSPENDED', 'EXPIRED') THEN
        RAISE EXCEPTION 'terminal charge agreement versions are immutable'
            USING ERRCODE = '55000';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_charge_agreement_versions_approved_immutable
    BEFORE UPDATE OR DELETE
    ON charge_agreement_versions
    FOR EACH ROW EXECUTE FUNCTION protect_approved_charge_agreement_version();

CREATE OR REPLACE FUNCTION protect_approved_charge_agreement_rate_link()
RETURNS TRIGGER AS $$
DECLARE
    protected_lifecycle VARCHAR(32);
BEGIN
    SELECT lifecycle INTO protected_lifecycle
    FROM charge_agreement_versions
    WHERE agreement_version_id = CASE WHEN TG_OP = 'INSERT' THEN NEW.agreement_version_id ELSE OLD.agreement_version_id END;

    IF protected_lifecycle IN ('APPROVED', 'SUSPENDED', 'EXPIRED') THEN
        RAISE EXCEPTION 'approved charge agreement rate links are immutable'
            USING ERRCODE = '55000';
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.agreement_version_id IS DISTINCT FROM OLD.agreement_version_id THEN
        SELECT lifecycle INTO protected_lifecycle
        FROM charge_agreement_versions
        WHERE agreement_version_id = NEW.agreement_version_id;
        IF protected_lifecycle IN ('APPROVED', 'SUSPENDED', 'EXPIRED') THEN
            RAISE EXCEPTION 'approved charge agreement rate links are immutable'
                USING ERRCODE = '55000';
        END IF;
    END IF;

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_charge_agreement_rate_links_approved_immutable
    BEFORE INSERT OR UPDATE OR DELETE
    ON charge_agreement_rate_links
    FOR EACH ROW EXECUTE FUNCTION protect_approved_charge_agreement_rate_link();
