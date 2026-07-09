package com.linercore.platform.containermovement.domain.model;

public record JourneyId(String value) {
    public JourneyId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("journey id is required");
        }
    }
}
