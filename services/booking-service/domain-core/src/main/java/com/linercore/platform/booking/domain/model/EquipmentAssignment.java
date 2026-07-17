package com.linercore.platform.booking.domain.model;

import java.util.Locale;

public record EquipmentAssignment(
        String equipmentTypeCode,
        int quantity,
        String equipmentId) {

    public EquipmentAssignment {
        equipmentTypeCode = required(equipmentTypeCode, "equipment type code").toUpperCase(Locale.ROOT);
        if (quantity != 1) {
            throw new IllegalArgumentException("W1 equipment quantity must be one");
        }
        equipmentId = required(equipmentId, "equipment id").toUpperCase(Locale.ROOT);
        if (!Iso6346.isValid(equipmentId)) {
            throw new IllegalArgumentException("equipment id must be a valid ISO 6346 identifier");
        }
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}
