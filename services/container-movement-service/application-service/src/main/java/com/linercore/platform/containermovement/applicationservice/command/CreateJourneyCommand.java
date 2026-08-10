package com.linercore.platform.containermovement.applicationservice.command;

import java.util.List;

public record CreateJourneyCommand(
        String bookingId,
        String containerId,
        List<String> routeLocationIds,
        String actorSubjectId,
        String idempotencyKey,
        String correlationId) {
    public CreateJourneyCommand {
        routeLocationIds = List.copyOf(routeLocationIds == null ? List.of() : routeLocationIds);
    }
}
