package com.linercore.platform.containermovement.domain.outbox;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class MovementStatusEventMapper {
    public static final String EVENT_TYPE = "containermovement.status";
    public static final String SCHEMA_VERSION = "1.0.0";
    public static final String SOURCE = "container-movement-service";

    public MovementStatusEvent statusEvent(String eventId, ContainerJourney journey, String correlationId, Instant now) {
        long sequenceNumber = journey.history().size();
        MovementEvent latest = journey.history().isEmpty() ? null : journey.history().get(journey.history().size() - 1);
        String dedupe = journey.id().value() + ":" + journey.status().name() + ":" + sequenceNumber;
        Map<String, String> payload = new HashMap<>();
        payload.put("eventId", eventId);
        payload.put("eventType", EVENT_TYPE);
        payload.put("schemaVersion", SCHEMA_VERSION);
        payload.put("source", SOURCE);
        payload.put("occurredAt", now.toString());
        payload.put("correlationId", correlationId);
        payload.put("idempotencyKey", dedupe);
        payload.put("journeyId", journey.id().value());
        payload.put("bookingId", journey.bookingId());
        payload.put("containerId", journey.containerId());
        payload.put("movementStatus", journey.status().name());
        payload.put("sequenceNumber", String.valueOf(sequenceNumber));
        payload.put("statusReason", latest == null ? "Journey created" : "Validated movement " + latest.eventType().name());
        payload.put("lastKnownLocationId", latest == null ? "" : latest.locationId());
        return new MovementStatusEvent(eventId, EVENT_TYPE, SCHEMA_VERSION, journey.id().value(), journey.bookingId(),
                journey.containerId(), journey.status(), EVENT_TYPE + "-value", SOURCE, dedupe, correlationId, now,
                payload, OutboxStatus.PENDING, 0, null, null, null, null, null);
    }
}
