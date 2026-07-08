package com.linercore.platform.referencedata.domain.validation;

import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
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
        return errors.isEmpty() ? ValidationResult.ok() : ValidationResult.invalid(errors);
    }
}
