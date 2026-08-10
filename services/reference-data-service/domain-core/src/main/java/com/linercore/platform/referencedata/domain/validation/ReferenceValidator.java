package com.linercore.platform.referencedata.domain.validation;

import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ChargeCode;
import com.linercore.platform.referencedata.domain.model.EquipmentType;
import com.linercore.platform.referencedata.domain.model.Vessel;
import com.linercore.platform.referencedata.domain.model.Voyage;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ReferenceValidator {
    public ValidationResult validate(ReferenceRecord record, Map<String, ReferenceRecord> relatedRecords) {
        List<String> errors = new ArrayList<>();
        if (record.code().value().isBlank()) {
            errors.add("code is required");
        }
        if (record.set() == ReferenceSet.LOCATION && "PORT".equals(record.attributes().get("locationType"))
                && record.attributes().getOrDefault("parentCountryId", "").isBlank()) {
            errors.add("port must reference exactly one active country parent");
        }
        if (record.set() == ReferenceSet.TRADE_LANE) {
            String origin = record.attributes().get("originRegionId");
            String destination = record.attributes().get("destinationRegionId");
            if (origin == null || destination == null) {
                errors.add("trade lane requires origin and destination regions");
            }
            if (origin != null && !relatedRecords.containsKey(origin)) {
                errors.add("origin region must exist and be active");
            }
            if (destination != null && !relatedRecords.containsKey(destination)) {
                errors.add("destination region must exist and be active");
            }
        }
        if (record.set() == ReferenceSet.EQUIPMENT_TYPE) {
            validateProjection(errors, () -> EquipmentType.from(record));
        }
        if (record.set() == ReferenceSet.CHARGE_CODE) {
            validateProjection(errors, () -> ChargeCode.from(record));
        }
        if (record.set() == ReferenceSet.VESSEL_VOYAGE) {
            validateVesselVoyage(record, relatedRecords, errors);
        }
        return errors.isEmpty() ? ValidationResult.ok() : ValidationResult.invalid(errors);
    }

    private void validateVesselVoyage(
            ReferenceRecord record,
            Map<String, ReferenceRecord> relatedRecords,
            List<String> errors) {
        String recordType = record.attributes().get("recordType");
        if ("VESSEL".equals(recordType)) {
            validateProjection(errors, () -> Vessel.from(record));
            return;
        }
        if (!"VOYAGE".equals(recordType)) {
            errors.add("recordType must be VESSEL or VOYAGE");
            return;
        }
        try {
            Voyage voyage = Voyage.from(record);
            ReferenceRecord vessel = relatedRecords.get(voyage.vesselId().value());
            if (vessel == null || vessel.set() != ReferenceSet.VESSEL_VOYAGE
                    || !"VESSEL".equals(vessel.attributes().get("recordType"))) {
                errors.add("vesselId must reference an active vessel");
            }
            requireActiveLocation(voyage.originLocationId().value(), "originLocationId", relatedRecords, errors);
            requireActiveLocation(voyage.destinationLocationId().value(), "destinationLocationId", relatedRecords, errors);
        } catch (IllegalArgumentException exception) {
            errors.add(exception.getMessage());
        }
    }

    private void requireActiveLocation(
            String id,
            String field,
            Map<String, ReferenceRecord> relatedRecords,
            List<String> errors) {
        ReferenceRecord location = relatedRecords.get(id);
        if (location == null || location.set() != ReferenceSet.LOCATION) {
            errors.add(field + " must reference an active location");
        }
    }

    private void validateProjection(List<String> errors, Runnable projection) {
        try {
            projection.run();
        } catch (IllegalArgumentException exception) {
            errors.add(exception.getMessage());
        }
    }
}
