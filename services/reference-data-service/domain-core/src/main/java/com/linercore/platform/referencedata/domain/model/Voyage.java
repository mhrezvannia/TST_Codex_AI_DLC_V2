package com.linercore.platform.referencedata.domain.model;

import java.time.Instant;

public record Voyage(
        ReferenceRecord record,
        ReferenceId vesselId,
        String carrierVoyageNumber,
        ReferenceId originLocationId,
        ReferenceId destinationLocationId,
        Instant scheduledDeparture,
        Instant scheduledArrival) {
    public Voyage {
        if (record.set() != ReferenceSet.VESSEL_VOYAGE) {
            throw new IllegalArgumentException("voyage must belong to vessel-voyage reference set");
        }
        require(carrierVoyageNumber, "carrierVoyageNumber is required");
        if (!record.code().value().equals(carrierVoyageNumber)) {
            throw new IllegalArgumentException("voyage code must match carrierVoyageNumber");
        }
        if (!scheduledArrival.isAfter(scheduledDeparture)) {
            throw new IllegalArgumentException("scheduledArrival must be after scheduledDeparture");
        }
        if (originLocationId.equals(destinationLocationId)) {
            throw new IllegalArgumentException("originLocationId and destinationLocationId must differ");
        }
    }

    public static Voyage from(ReferenceRecord record) {
        if (!"VOYAGE".equals(record.attributes().get("recordType"))) {
            throw new IllegalArgumentException("recordType must be VOYAGE");
        }
        try {
            return new Voyage(
                    record,
                    new ReferenceId(required(record, "vesselId")),
                    required(record, "carrierVoyageNumber"),
                    new ReferenceId(required(record, "originLocationId")),
                    new ReferenceId(required(record, "destinationLocationId")),
                    Instant.parse(required(record, "scheduledDeparture")),
                    Instant.parse(required(record, "scheduledArrival")));
        } catch (java.time.format.DateTimeParseException exception) {
            throw new IllegalArgumentException("scheduledDeparture and scheduledArrival must be ISO-8601 instants");
        }
    }

    private static String required(ReferenceRecord record, String field) {
        String value = record.attributes().get(field);
        require(value, field + " is required");
        return value;
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
