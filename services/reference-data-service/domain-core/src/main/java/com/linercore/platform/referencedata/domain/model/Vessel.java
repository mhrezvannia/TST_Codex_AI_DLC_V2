package com.linercore.platform.referencedata.domain.model;

public record Vessel(ReferenceRecord record, String vesselName, String vesselIMONumber) {
    public Vessel {
        if (record.set() != ReferenceSet.VESSEL_VOYAGE) {
            throw new IllegalArgumentException("vessel must belong to vessel-voyage reference set");
        }
        require(vesselName, "vesselName is required");
        if (vesselIMONumber == null || !vesselIMONumber.matches("\\d{7}") || !hasValidImoChecksum(vesselIMONumber)) {
            throw new IllegalArgumentException("vesselIMONumber must be a valid seven-digit IMO number");
        }
        if (!record.code().value().equals(vesselIMONumber)) {
            throw new IllegalArgumentException("vessel code must match vesselIMONumber");
        }
    }

    public static Vessel from(ReferenceRecord record) {
        if (!"VESSEL".equals(record.attributes().get("recordType"))) {
            throw new IllegalArgumentException("recordType must be VESSEL");
        }
        return new Vessel(record, record.attributes().get("vesselName"), record.attributes().get("vesselIMONumber"));
    }

    private static boolean hasValidImoChecksum(String value) {
        int sum = 0;
        for (int index = 0; index < 6; index++) {
            sum += Character.digit(value.charAt(index), 10) * (7 - index);
        }
        return sum % 10 == Character.digit(value.charAt(6), 10);
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
