package com.linercore.platform.containermovement.domain.model;

public record ExpectedMovement(
        String sequence,
        MovementEventType expectedEventType,
        String locationId) {
}
