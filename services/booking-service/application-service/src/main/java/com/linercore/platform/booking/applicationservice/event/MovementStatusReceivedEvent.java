package com.linercore.platform.booking.applicationservice.event;

import com.linercore.platform.booking.applicationservice.port.MovementLocation;
import java.time.Instant;
import java.util.Map;

public record MovementStatusReceivedEvent(
        String eventId,
        String eventType,
        String source,
        Instant eventTime,
        String correlationId,
        int dataSchemaVersion,
        String bookingRef,
        String containerRef,
        String movementId,
        String moveCode,
        String eventClassifierCode,
        Instant occurredDateTime,
        Instant receivedDateTime,
        String derivedStatus,
        String emptyIndicatorCode,
        boolean transshipment,
        MovementLocation location) {
    public static final String EVENT_TYPE = "containermovement.status";
    public static final String SOURCE = "container-movement-service";
    public static final int DATA_SCHEMA_VERSION = 1;

    public MovementStatusReceivedEvent {
        require(eventId, "event id is required");
        require(eventType, "event type is required");
        require(source, "source is required");
        require(correlationId, "correlation id is required");
        require(bookingRef, "booking ref is required");
        require(containerRef, "container ref is required");
        require(moveCode, "move code is required");
        require(eventClassifierCode, "event classifier code is required");
        require(derivedStatus, "derived status is required");
        require(emptyIndicatorCode, "empty indicator code is required");
        if (!EVENT_TYPE.equals(eventType)) {
            throw new IllegalArgumentException("unsupported movement status event type");
        }
        if (!SOURCE.equals(source)) {
            throw new IllegalArgumentException("unsupported movement status source");
        }
        if (dataSchemaVersion != DATA_SCHEMA_VERSION) {
            throw new IllegalArgumentException("unsupported movement status schema version");
        }
        if (!eventClassifierCode.equals("PLN") && !eventClassifierCode.equals("EST")
                && !eventClassifierCode.equals("ACT")) {
            throw new IllegalArgumentException("unsupported event classifier code");
        }
        if (!emptyIndicatorCode.equals("EMPTY") && !emptyIndicatorCode.equals("LADEN")) {
            throw new IllegalArgumentException("unsupported empty indicator code");
        }
        if (eventTime == null || occurredDateTime == null || receivedDateTime == null) {
            throw new IllegalArgumentException("movement status times are required");
        }
        if (location != null && location.unLocationCode() != null
                && !location.unLocationCode().matches("[A-Z]{5}")) {
            throw new IllegalArgumentException("location UN/LOCODE must be five uppercase letters");
        }
    }

    public String idempotencyKey() {
        return eventId;
    }

    public static MovementStatusReceivedEvent fromPayload(Map<String, String> payload) {
        MovementLocation location = null;
        if ("true".equals(payload.get("data.location.present"))) {
            location = new MovementLocation(
                    blankToNull(payload.get("data.location.unLocationCode")),
                    blankToNull(payload.get("data.location.facilityCode")),
                    blankToNull(payload.get("data.location.facilityTypeCode")));
        }
        return new MovementStatusReceivedEvent(
                payload.get("id"),
                payload.get("type"),
                payload.get("source"),
                Instant.parse(payload.get("time")),
                payload.get("correlationId"),
                Integer.parseInt(payload.get("dataSchemaVersion")),
                payload.get("data.bookingRef"),
                payload.get("data.containerRef"),
                blankToNull(payload.get("data.movementId")),
                payload.get("data.moveCode"),
                payload.get("data.eventClassifierCode"),
                Instant.parse(payload.get("data.occurredDateTime")),
                Instant.parse(payload.get("data.receivedDateTime")),
                payload.get("data.derivedStatus"),
                payload.get("data.emptyIndicatorCode"),
                Boolean.parseBoolean(payload.get("data.transshipment")),
                location);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
