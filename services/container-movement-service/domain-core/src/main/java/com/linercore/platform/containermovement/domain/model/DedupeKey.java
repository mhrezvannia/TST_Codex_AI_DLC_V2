package com.linercore.platform.containermovement.domain.model;

public record DedupeKey(String value) {
    public DedupeKey {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("dedupe key is required");
        }
    }
}
