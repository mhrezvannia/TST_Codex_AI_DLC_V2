package com.linercore.platform.referencedata.domain.outbox;

import java.util.HashMap;
import java.util.Map;

public class ReferenceEventMapper {
    public static final String SCHEMA_VERSION = "1.0.0";

    public OutboxEvent toOutboxEvent(String eventId, ReferenceChangedFact fact) {
        Map<String, String> payload = new HashMap<>(fact.payloadSnapshot());
        payload.put("changeId", fact.changeId());
        payload.put("businessKey", fact.businessKey());
        payload.put("producerIdentity", fact.producerIdentity());
        payload.put("deduplicationKey", fact.deduplicationKey());
        payload.put("schemaSubject", eventType(fact) + "-value");
        payload.put("correlationId", fact.correlationId());
        return new OutboxEvent(eventId, eventType(fact), fact.referenceSet(), fact.entityId(), fact.operation(),
                Map.copyOf(payload), SCHEMA_VERSION, OutboxStatus.PENDING, 0, fact.occurredAt(), null, null,
                null, null, fact.correlationId(), fact.occurredAt());
    }

    public ReferenceEventEnvelope envelope(OutboxEvent event) {
        return new ReferenceEventEnvelope(event.eventId(), event.eventType(), event.schemaVersion(),
                "reference-data-service", event.occurredAt(), event.correlationId(), event.entityId(),
                event.operation(), "reference-data-service/0.1.0");
    }

    private String eventType(ReferenceChangedFact fact) {
        return "referencedata." + fact.referenceSet().eventPath() + ".changed";
    }
}
