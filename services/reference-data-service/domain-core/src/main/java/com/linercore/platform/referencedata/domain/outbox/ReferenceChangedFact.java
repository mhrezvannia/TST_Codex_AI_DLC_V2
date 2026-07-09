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
        String correlationId,
        String producerIdentity,
        String deduplicationKey) {
    public ReferenceChangedFact(
            String changeId,
            ReferenceSet referenceSet,
            String entityId,
            String businessKey,
            ReferenceOperation operation,
            Map<String, String> changedFields,
            Map<String, String> payloadSnapshot,
            Instant occurredAt,
            String correlationId) {
        this(changeId, referenceSet, entityId, businessKey, operation, changedFields, payloadSnapshot, occurredAt,
                correlationId, "reference-data-service", referenceSet.name() + ":" + entityId + ":" + operation.name() + ":" + changeId);
    }
}
