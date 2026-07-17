package com.linercore.platform.containermovement.domain.outbox;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import com.linercore.platform.containermovement.domain.model.MovementEventType;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class MovementStatusEventMapper {
    public static final String EVENT_TYPE = "containermovement.status";
    public static final String SCHEMA_VERSION = "1";
    public static final String SOURCE = "container-movement-service";

    public MovementStatusEvent statusEvent(String eventId, ContainerJourney journey, String correlationId, Instant now) {
        MovementEvent latest = journey.history().isEmpty() ? null : journey.history().get(journey.history().size() - 1);
        String location = latest == null
                ? journey.expectedMovements().isEmpty() ? null : journey.expectedMovements().get(0).locationId()
                : latest.locationId();
        String classifier = classifier(latest == null ? MovementEventType.PLANNED_DEPARTURE : latest.eventType());
        String moveCode = moveCode(latest == null ? MovementEventType.PLANNED_DEPARTURE : latest.eventType());
        String dedupe = eventId;
        Map<String, String> payload = new HashMap<>();
        payload.put("id", eventId);
        payload.put("source", SOURCE);
        payload.put("type", EVENT_TYPE);
        payload.put("time", now.toString());
        payload.put("correlationId", correlationId);
        payload.put("dataSchemaVersion", "1");
        payload.put("data.bookingRef", journey.bookingId());
        payload.put("data.containerRef", journey.containerId());
        payload.put("data.movementId", latest == null ? "" : latest.eventId());
        payload.put("data.moveCode", moveCode);
        payload.put("data.eventClassifierCode", classifier);
        payload.put("data.occurredDateTime", latest == null ? now.toString() : latest.eventTime().toString());
        payload.put("data.receivedDateTime", now.toString());
        payload.put("data.derivedStatus", journey.status().name());
        payload.put("data.emptyIndicatorCode", "LADEN");
        payload.put("data.transshipment", "false");
        payload.put("data.location.present", String.valueOf(location != null && !location.isBlank()));
        payload.put("data.location.unLocationCode", location == null ? "" : location);
        payload.put("data.location.facilityCode", "");
        payload.put("data.location.facilityTypeCode", "");
        return new MovementStatusEvent(eventId, EVENT_TYPE, SCHEMA_VERSION, journey.id().value(), journey.bookingId(),
                journey.containerId(), journey.status(), EVENT_TYPE + "-value", SOURCE, dedupe, correlationId, now,
                payload, OutboxStatus.PENDING, 0, null, null, null, null, null);
    }

    private String classifier(MovementEventType type) {
        return switch (type) {
            case PLANNED_DEPARTURE -> "PLN";
            case ESTIMATED_ARRIVAL -> "EST";
            case ACTUAL_DEPARTURE, ACTUAL_ARRIVAL, DELIVERED, EXCEPTION -> "ACT";
        };
    }

    private String moveCode(MovementEventType type) {
        return switch (type) {
            case PLANNED_DEPARTURE, ACTUAL_DEPARTURE -> "LOAD";
            case ESTIMATED_ARRIVAL, ACTUAL_ARRIVAL -> "DISC";
            case DELIVERED -> "DELV";
            case EXCEPTION -> "EXCP";
        };
    }
}
