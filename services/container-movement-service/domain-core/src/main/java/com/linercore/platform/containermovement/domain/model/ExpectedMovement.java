package com.linercore.platform.containermovement.domain.model;

public record ExpectedMovement(
        String sequence,
        EventClassifierCode eventClassifierCode,
        EquipmentEventTypeCode moveCode,
        String locationId) {
    public ExpectedMovement {
        if (sequence == null || sequence.isBlank()) {
            throw new IllegalArgumentException("expected movement sequence is required");
        }
        if (eventClassifierCode != EventClassifierCode.PLN) {
            throw new IllegalArgumentException("expected movement classifier must be PLN");
        }
        if (moveCode != EquipmentEventTypeCode.LOAD && moveCode != EquipmentEventTypeCode.DISC) {
            throw new IllegalArgumentException("expected movement code must be LOAD or DISC");
        }
        if (locationId == null || locationId.isBlank()) {
            throw new IllegalArgumentException("expected movement location is required");
        }
    }
}
