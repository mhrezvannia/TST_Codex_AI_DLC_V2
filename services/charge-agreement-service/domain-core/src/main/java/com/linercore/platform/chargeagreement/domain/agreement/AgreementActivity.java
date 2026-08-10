package com.linercore.platform.chargeagreement.domain.agreement;

import java.time.Instant;
import java.util.Objects;

public record AgreementActivity(
        String activityId,
        AgreementId agreementId,
        AgreementVersionId agreementVersionId,
        AgreementActivityAction action,
        String actorSubjectId,
        Instant occurredAt,
        String correlationId,
        String reason,
        long resultingRowVersion) {

    public AgreementActivity {
        AgreementId.requireIdentifier(activityId, "activity id");
        Objects.requireNonNull(agreementId, "agreement id is required");
        Objects.requireNonNull(agreementVersionId, "agreement version id is required");
        Objects.requireNonNull(action, "action is required");
        requireText(actorSubjectId, "actor subject id", 128);
        Objects.requireNonNull(occurredAt, "occurred at is required");
        requireText(correlationId, "correlation id", 128);
        if (resultingRowVersion < 0) {
            throw new IllegalArgumentException("resulting row version must be nonnegative");
        }
        if (action != AgreementActivityAction.CREATED) {
            requireText(reason, "reason", 512);
        } else if (reason != null && reason.length() > 512) {
            throw new IllegalArgumentException("reason must not exceed 512 characters");
        }
    }

    static void requireText(String value, String field, int maximum) {
        if (value == null || value.isBlank() || value.length() > maximum) {
            throw new IllegalArgumentException(field + " is required and must not exceed " + maximum + " characters");
        }
    }
}
