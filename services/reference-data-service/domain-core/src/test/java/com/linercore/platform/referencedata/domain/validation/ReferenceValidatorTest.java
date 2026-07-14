package com.linercore.platform.referencedata.domain.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.referencedata.domain.model.AuditActor;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReferenceValidatorTest {
    private final ReferenceValidator validator = new ReferenceValidator();

    @Test
    void rejectsOrphanPort() {
        ReferenceRecord port = record(ReferenceSet.LOCATION, Map.of("locationType", "PORT"));
        assertFalse(validator.validate(port, Map.of()).valid());
    }

    @Test
    void acceptsTradeLaneWithActiveRegions() {
        ReferenceRecord lane = record(ReferenceSet.TRADE_LANE, Map.of("originRegionId", "r1", "destinationRegionId", "r2"));
        assertTrue(validator.validate(lane, Map.of("r1", region("r1"), "r2", region("r2"))).valid());
    }

    @Test
    void acceptsCanonicalVesselAndVoyage() {
        ReferenceRecord vessel = record("vessel-1", ReferenceSet.VESSEL_VOYAGE, "9387425", Map.of(
                "recordType", "VESSEL",
                "vesselName", "LinerCore Atlas",
                "vesselIMONumber", "9387425"));
        ReferenceRecord origin = record("location-origin", ReferenceSet.LOCATION, "USNYC", Map.of("locationType", "PORT", "parentCountryId", "country-us"));
        ReferenceRecord destination = record("location-destination", ReferenceSet.LOCATION, "NLRTM", Map.of("locationType", "PORT", "parentCountryId", "country-nl"));
        ReferenceRecord voyage = record("voyage-1", ReferenceSet.VESSEL_VOYAGE, "LC001E", Map.of(
                "recordType", "VOYAGE",
                "vesselId", "vessel-1",
                "carrierVoyageNumber", "LC001E",
                "originLocationId", "location-origin",
                "destinationLocationId", "location-destination",
                "scheduledDeparture", "2026-08-01T10:00:00Z",
                "scheduledArrival", "2026-08-10T08:00:00Z"));

        Map<String, ReferenceRecord> related = Map.of(
                "vessel-1", vessel,
                "location-origin", origin,
                "location-destination", destination);
        assertTrue(validator.validate(vessel, related).valid());
        assertTrue(validator.validate(voyage, related).valid());
    }

    @Test
    void rejectsVoyageWithUnknownVessel() {
        ReferenceRecord voyage = record("voyage-1", ReferenceSet.VESSEL_VOYAGE, "LC001E", Map.of(
                "recordType", "VOYAGE",
                "vesselId", "missing-vessel",
                "carrierVoyageNumber", "LC001E",
                "originLocationId", "location-origin",
                "destinationLocationId", "location-destination",
                "scheduledDeparture", "2026-08-01T10:00:00Z",
                "scheduledArrival", "2026-08-10T08:00:00Z"));

        assertFalse(validator.validate(voyage, Map.of()).valid());
    }

    @Test
    void enforcesIsoEquipmentAndChargeFamily() {
        assertTrue(validator.validate(record("equipment-1", ReferenceSet.EQUIPMENT_TYPE, "45G1", Map.of()), Map.of()).valid());
        assertFalse(validator.validate(record("equipment-2", ReferenceSet.EQUIPMENT_TYPE, "40HC", Map.of()), Map.of()).valid());
        assertTrue(validator.validate(record("charge-1", ReferenceSet.CHARGE_CODE, "OFR", Map.of("chargeFamily", "freight")), Map.of()).valid());
        assertFalse(validator.validate(record("charge-2", ReferenceSet.CHARGE_CODE, "BAF", Map.of()), Map.of()).valid());
    }

    private ReferenceRecord region(String id) {
        return record(id, ReferenceSet.REGION, Map.of());
    }

    private ReferenceRecord record(ReferenceSet set, Map<String, String> attributes) {
        return record("id-1", set, attributes);
    }

    private ReferenceRecord record(String id, ReferenceSet set, Map<String, String> attributes) {
        return record(id, set, id, attributes);
    }

    private ReferenceRecord record(String id, ReferenceSet set, String code, Map<String, String> attributes) {
        AuditActor actor = new AuditActor("tester", "Tester");
        return new ReferenceRecord(new ReferenceId(id), set, new ReferenceCode(code), "Name", ReferenceStatus.ACTIVE,
                1, actor, Instant.EPOCH, actor, Instant.EPOCH, null, null, null, attributes);
    }
}
