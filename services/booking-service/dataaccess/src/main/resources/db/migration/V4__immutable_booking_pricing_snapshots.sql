CREATE OR REPLACE FUNCTION protect_booking_pricing_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'booking pricing snapshots are immutable'
        USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_pricing_snapshots_immutable
    BEFORE UPDATE OR DELETE
    ON booking_pricing_snapshots
    FOR EACH ROW EXECUTE FUNCTION protect_booking_pricing_snapshot();
