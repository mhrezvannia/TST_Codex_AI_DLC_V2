package com.linercore.platform.referencedata.domain.outbox;

import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.time.Instant;
import java.util.Map;

public record ReferenceChangedFact(
        String changeId,
        ReferenceSet referenceSet,
        String entityId,
        String businessKey,
        ReferenceOperation operation,
        Map<String, String> changedFields,
        Map<String, String> payloadSnapshot,
        Instant occurredAt,
        String correlationId) {
}
