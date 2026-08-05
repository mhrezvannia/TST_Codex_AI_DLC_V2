package com.linercore.platform.referencedata.domain.model;

public record EquipmentType(ReferenceRecord record, String isoSizeTypeCode) {
    public EquipmentType {
        if (record.set() != ReferenceSet.EQUIPMENT_TYPE) {
            throw new IllegalArgumentException("equipment type must belong to equipment-type reference set");
        }
        if (isoSizeTypeCode == null || !isoSizeTypeCode.matches("\\d{2}[A-Z]\\d")) {
            throw new IllegalArgumentException("equipment type code must be an ISO 6346 size/type code");
        }
    }

    public static EquipmentType from(ReferenceRecord record) {
        return new EquipmentType(record, record.code().value());
    }
}
