package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import java.time.Instant;

public record MovementStatusProjection(
        String bookingRef,
        String containerRef,
        String movementId,
        String moveCode,
        String eventClassifierCode,
        int classifierRank,
        Instant occurredDateTime,
        Instant receivedDateTime,
        String derivedStatus,
        String emptyIndicatorCode,
        boolean transshipment,
        MovementLocation location,
        String eventId,
        String source,
        Instant eventTime,
        int dataSchemaVersion,
        String correlationId,
        Instant projectedAt) {
    public static MovementStatusProjection from(MovementStatusReceivedEvent event, Instant projectedAt) {
        return new MovementStatusProjection(
                event.bookingRef(),
                event.containerRef(),
                event.movementId(),
                event.moveCode(),
                event.eventClassifierCode(),
                classifierRank(event.eventClassifierCode()),
                event.occurredDateTime(),
                event.receivedDateTime(),
                event.derivedStatus(),
                event.emptyIndicatorCode(),
                event.transshipment(),
                event.location(),
                event.eventId(),
                event.source(),
                event.eventTime(),
                event.dataSchemaVersion(),
                event.correlationId(),
                projectedAt);
    }

    public static int classifierRank(String classifier) {
        return switch (classifier) {
            case "PLN" -> 1;
            case "EST" -> 2;
            case "ACT" -> 3;
            default -> throw new IllegalArgumentException("unsupported event classifier code");
        };
    }
}
