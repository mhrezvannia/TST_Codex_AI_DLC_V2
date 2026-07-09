package com.linercore.platform.booking.applicationservice.command;

import java.util.Map;

public record CreateBookingCommand(
        String idempotencyKey,
        String customerId,
        String originLocationId,
        String destinationLocationId,
        String equipmentType,
        Map<String, String> attributes,
        String actorSubjectId,
        String correlationId) {
}
