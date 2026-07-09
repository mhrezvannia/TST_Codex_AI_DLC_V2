package com.linercore.platform.containermovement.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public record ContainerJourney(
        JourneyId id,
        String bookingId,
        String containerId,
        MovementStatus status,
        List<ExpectedMovement> expectedMovements,
        List<MovementEvent> history,
        Instant updatedAt) {
    public ContainerJourney {
        if (bookingId == null || bookingId.isBlank()) {
            throw new IllegalArgumentException("booking id is required");
        }
        if (containerId == null || containerId.isBlank()) {
            throw new IllegalArgumentException("container id is required");
        }
        expectedMovements = List.copyOf(expectedMovements == null ? List.of() : expectedMovements);
        history = List.copyOf(history == null ? List.of() : history);
    }

    public static ContainerJourney create(
            JourneyId id,
            String bookingId,
            String containerId,
            List<String> routeLocationIds,
            Instant now) {
        List<ExpectedMovement> expected = new ArrayList<>();
        for (int index = 0; index < routeLocationIds.size(); index++) {
            MovementEventType type = index == 0 ? MovementEventType.PLANNED_DEPARTURE : MovementEventType.ESTIMATED_ARRIVAL;
            expected.add(new ExpectedMovement(String.valueOf(index + 1), type, routeLocationIds.get(index)));
        }
        return new ContainerJourney(id, bookingId, containerId, MovementStatus.PLANNED, expected, List.of(), now);
    }

    public MovementValidationResult validate(MovementEvent event) {
        if (!containerId.equals(event.containerId())) {
            return MovementValidationResult.invalid(List.of("event container does not match journey"));
        }
        if (history.stream().anyMatch(existing -> existing.dedupeKey().equals(event.dedupeKey()))) {
            return MovementValidationResult.invalid(List.of("duplicate movement event"));
        }
        if (latestEventTime() != null && event.eventTime().isBefore(latestEventTime())) {
            return MovementValidationResult.invalid(List.of("movement event is out of order"));
        }
        return MovementValidationResult.ok();
    }

    public ContainerJourney capture(MovementEvent event) {
        MovementValidationResult validation = validate(event);
        if (!validation.valid()) {
            throw new IllegalArgumentException(String.join(",", validation.errors()));
        }
        ArrayList<MovementEvent> nextHistory = new ArrayList<>(history);
        nextHistory.add(event);
        return new ContainerJourney(id, bookingId, containerId, deriveStatus(event), expectedMovements, nextHistory, event.eventTime());
    }

    private MovementStatus deriveStatus(MovementEvent event) {
        return switch (event.eventType()) {
            case ACTUAL_DEPARTURE -> MovementStatus.IN_TRANSIT;
            case ACTUAL_ARRIVAL -> MovementStatus.ARRIVED;
            case DELIVERED -> MovementStatus.DELIVERED;
            case EXCEPTION -> MovementStatus.EXCEPTION;
            default -> status;
        };
    }

    private Instant latestEventTime() {
        return history.stream().map(MovementEvent::eventTime).max(Comparator.naturalOrder()).orElse(null);
    }
}
