package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.ReferenceFieldResult;
import com.linercore.platform.booking.domain.model.ReferenceValidationOutcome;
import com.linercore.platform.booking.domain.model.ReferenceValidationSnapshot;
import java.time.Instant;
import java.util.List;

public record ReferenceValidationResult(
        int bookingRevision,
        String referenceFingerprint,
        List<ReferenceFieldResult> fieldResults,
        Instant checkedAt,
        String correlationId) {

    public ReferenceValidationResult {
        fieldResults = List.copyOf(fieldResults == null ? List.of() : fieldResults);
    }

    public ReferenceValidationSnapshot toSnapshot() {
        ReferenceValidationOutcome outcome = fieldResults.stream()
                .allMatch(result -> result.outcome()
                        == com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome.ACTIVE)
                ? ReferenceValidationOutcome.VALID
                : ReferenceValidationOutcome.BLOCKED;
        return new ReferenceValidationSnapshot(bookingRevision, referenceFingerprint, outcome, fieldResults,
                checkedAt, correlationId);
    }
}
