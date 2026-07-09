package com.linercore.platform.containermovement.domain.outbox;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import java.time.Instant;
import java.util.Map;

public class MovementStatusEventMapper {
    public static final String EVENT_TYPE = "containermovement.status";
    public static final String SCHEMA_VERSION = "1.0.0";

    public MovementStatusEvent statusEvent(String eventId, ContainerJourney journey, String correlationId, Instant now) {
        String dedupe = journey.id().value() + ":" + journey.status().name() + ":" + journey.updatedAt();
        return new MovementStatusEvent(eventId, EVENT_TYPE, SCHEMA_VERSION, journey.id().value(), journey.bookingId(),
                journey.containerId(), journey.status(), EVENT_TYPE + "-value", "container-movement-service", dedupe,
                correlationId, now,
                Map.of(
                        "journeyId", journey.id().value(),
                        "bookingId", journey.bookingId(),
                        "containerId", journey.containerId(),
                        "status", journey.status().name(),
                        "correlationId", correlationId));
    }
}
