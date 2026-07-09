package com.linercore.platform.chargeagreement.domain.model;

import java.time.Instant;

public record ActivityEntry(String action, String actor, Instant occurredAt, String reason) {
    public ActivityEntry {
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("activity action is required");
        }
        if (actor == null || actor.isBlank()) {
            throw new IllegalArgumentException("activity actor is required");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("activity timestamp is required");
        }
        reason = reason == null ? "" : reason;
    }
}
