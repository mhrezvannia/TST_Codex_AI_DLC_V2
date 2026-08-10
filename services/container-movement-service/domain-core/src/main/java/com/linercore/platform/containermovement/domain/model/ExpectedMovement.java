package com.linercore.platform.containermovement.domain.model;

public record ExpectedMovement(
        String sequence,
        MovementEventType expectedEventType,
        String locationId) {
    public ExpectedMovement {
        if (sequence == null || sequence.isBlank()) {
            throw new IllegalArgumentException("expected movement sequence is required");
        }
        if (expectedEventType == null) {
            throw new IllegalArgumentException("expected event type is required");
        }
        if (locationId == null || locationId.isBlank()) {
            throw new IllegalArgumentException("expected movement location is required");
        }
    }
}
