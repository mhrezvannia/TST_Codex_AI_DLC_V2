package com.linercore.platform.containermovement.domain.model;

public enum MovementStatus {
    ALLOCATED,
    GATED_OUT,
    IN_TRANSIT,
    DISCHARGED,
    RETURNED_EMPTY,
    EXCEPTION,
    // Retained only so pre-canonical persisted snapshots remain readable.
    PLANNED,
    ARRIVED,
    DELIVERED
}
