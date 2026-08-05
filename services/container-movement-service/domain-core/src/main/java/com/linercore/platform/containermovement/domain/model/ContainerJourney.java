package com.linercore.platform.containermovement.domain.model;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public record ContainerJourney(
        JourneyId id,
        String bookingId,
        int bookingRevision,
        String containerId,
        MovementStatus status,
        List<ExpectedMovement> expectedMovements,
        List<MovementEvent> history,
        Instant updatedAt) {
    public ContainerJourney {
        if (bookingId == null || bookingId.isBlank()) {
            throw new IllegalArgumentException("booking id is required");
        }
        if (bookingRevision < 1) {
            throw new IllegalArgumentException("booking revision must be positive");
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
        return create(id, bookingId, 1, containerId, routeLocationIds, now);
    }

    public static ContainerJourney create(
            JourneyId id,
            String bookingId,
            int bookingRevision,
            String containerId,
            List<String> routeLocationIds,
            Instant now) {
        return new ContainerJourney(id, bookingId, bookingRevision, containerId, MovementStatus.ALLOCATED,
                expectedMovements(routeLocationIds), List.of(), now);
    }

    public ContainerJourney reconcileBookingRevision(int nextBookingRevision, List<String> routeLocationIds, Instant now) {
        if (nextBookingRevision <= bookingRevision) {
            return this;
        }
        return new ContainerJourney(id, bookingId, nextBookingRevision, containerId, status,
                expectedMovements(routeLocationIds), history, now);
    }

    public MovementValidationResult validate(MovementEvent event) {
        return validate(event, Clock.systemUTC());
    }

    public MovementValidationResult validate(MovementEvent event, Clock clock) {
        if (!containerId.equals(event.containerId())) {
            return MovementValidationResult.invalid(List.of("event container does not match journey"));
        }
        if (history.stream().anyMatch(existing -> existing.dedupeKey().equals(event.dedupeKey())
                || sameOccurrence(existing, event))) {
            return MovementValidationResult.invalid(List.of("duplicate movement event"));
        }
        if (latestEventTime() != null && event.eventTime().isBefore(latestEventTime())) {
            return MovementValidationResult.invalid(List.of("movement event is out of order"));
        }
        if (event.eventTime().isAfter(clock.instant())) {
            return MovementValidationResult.invalid(List.of("movement event time cannot be in the future"));
        }
        if (!requiredNextMove().equals(moveCode(event.eventType()))) {
            return MovementValidationResult.invalid(
                    List.of("expected " + requiredNextMove() + " as next captured movement"));
        }
        return MovementValidationResult.ok();
    }

    public ContainerJourney capture(MovementEvent event) {
        return capture(event, Clock.systemUTC());
    }

    public ContainerJourney capture(MovementEvent event, Clock clock) {
        MovementValidationResult validation = validate(event, clock);
        if (!validation.valid()) {
            throw new IllegalArgumentException(String.join(",", validation.errors()));
        }
        ArrayList<MovementEvent> nextHistory = new ArrayList<>(history);
        nextHistory.add(event);
        return new ContainerJourney(id, bookingId, bookingRevision, containerId, deriveStatus(event), expectedMovements, nextHistory, event.eventTime());
    }

    private static List<ExpectedMovement> expectedMovements(List<String> routeLocationIds) {
        if (routeLocationIds == null || routeLocationIds.isEmpty()) {
            throw new IllegalArgumentException("route locations are required");
        }
        String portOfLoading = routeLocationIds.get(0);
        String portOfDischarge = routeLocationIds.get(routeLocationIds.size() - 1);
        return List.of(
                new ExpectedMovement(
                        "1",
                        EventClassifierCode.PLN,
                        EquipmentEventTypeCode.LOAD,
                        portOfLoading),
                new ExpectedMovement(
                        "2",
                        EventClassifierCode.PLN,
                        EquipmentEventTypeCode.DISC,
                        portOfDischarge));
    }

    private MovementStatus deriveStatus(MovementEvent event) {
        return switch (moveCode(event.eventType())) {
            case "GTOT" -> MovementStatus.GATED_OUT;
            case "LOAD" -> MovementStatus.IN_TRANSIT;
            case "DISC" -> MovementStatus.DISCHARGED;
            case "GTIN" -> MovementStatus.RETURNED_EMPTY;
            default -> throw new IllegalArgumentException("unsupported actual movement type");
        };
    }

    public String requiredNextMove() {
        return switch (history.size()) {
            case 0 -> "GTOT";
            case 1 -> "LOAD";
            case 2 -> "DISC";
            case 3 -> "GTIN";
            default -> "NONE";
        };
    }

    private static String moveCode(MovementEventType type) {
        return switch (type) {
            case GTOT, ACT_GTOT -> "GTOT";
            case ACT_LOAD -> "LOAD";
            case ACT_DISC -> "DISC";
            case ACT_GTIN -> "GTIN";
            default -> "UNSUPPORTED";
        };
    }

    private static boolean sameOccurrence(MovementEvent existing, MovementEvent candidate) {
        return moveCode(existing.eventType()).equals(moveCode(candidate.eventType()))
                && existing.containerId().equals(candidate.containerId())
                && existing.locationId().equals(candidate.locationId())
                && existing.eventTime().equals(candidate.eventTime());
    }

    private Instant latestEventTime() {
        return history.stream().map(MovementEvent::eventTime).max(Comparator.naturalOrder()).orElse(null);
    }
}
