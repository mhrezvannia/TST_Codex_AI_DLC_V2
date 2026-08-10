package com.linercore.platform.chargeagreement.domain.rate;

import java.time.Instant;
import java.util.Objects;

public record RateActivity(
        String activityId,
        RateId rateId,
        RateVersionId versionId,
        long versionNo,
        Action action,
        String actorSubjectId,
        Instant occurredAt,
        String correlationId,
        String reason,
        long resultingRowVersion) {

    public RateActivity {
        RateId.requireIdentifier(activityId, "activity id");
        Objects.requireNonNull(rateId, "rate id is required");
        Objects.requireNonNull(versionId, "version id is required");
        if (versionNo <= 0 || resultingRowVersion < 0) {
            throw new IllegalArgumentException("version values are invalid");
        }
        Objects.requireNonNull(action, "action is required");
        requireText(actorSubjectId, "actor subject id");
        Objects.requireNonNull(occurredAt, "occurred at is required");
        requireText(correlationId, "correlation id");
    }

    private static void requireText(String value, String field) {
        if (value == null || value.isBlank() || value.length() > 128) {
            throw new IllegalArgumentException(field + " is required and must not exceed 128 characters");
        }
    }

    public enum Action {
        RATE_CREATED,
        RATE_DRAFT_UPDATED,
        RATE_SUCCESSOR_CREATED,
        RATE_VERSION_APPROVED
    }
}
