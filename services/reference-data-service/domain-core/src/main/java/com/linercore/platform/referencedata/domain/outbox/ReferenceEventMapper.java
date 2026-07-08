package com.linercore.platform.referencedata.domain.outbox;

import java.util.Locale;

public class ReferenceEventMapper {
    public static final String SCHEMA_VERSION = "1.0.0";

    public OutboxEvent toOutboxEvent(String eventId, ReferenceChangedFact fact) {
        return new OutboxEvent(eventId, eventType(fact), fact.referenceSet(), fact.entityId(), fact.operation(),
                fact.payloadSnapshot(), SCHEMA_VERSION, OutboxStatus.PENDING, 0, fact.occurredAt(), null, null,
                null, null, fact.correlationId(), fact.occurredAt());
    }

    public ReferenceEventEnvelope envelope(OutboxEvent event) {
        return new ReferenceEventEnvelope(event.eventId(), event.eventType(), event.schemaVersion(),
                "reference-data-service", event.occurredAt(), event.correlationId(), event.entityId(),
                event.operation(), "reference-data-service/0.1.0");
    }

    private String eventType(ReferenceChangedFact fact) {
        return "referencedata." + fact.referenceSet().name().toLowerCase(Locale.ROOT).replace('_', '-') + ".changed";
    }
}
