package com.linercore.platform.containermovement.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class ContainerJourneyTest {
    private final Instant now = Instant.parse("2026-07-01T00:00:00Z");

    @Test
    void createsExpectedMovementsFromRouteFacts() {
        ContainerJourney journey = journey();

        assertEquals(MovementStatus.PLANNED, journey.status());
        assertEquals(1, journey.bookingRevision());
        assertEquals(2, journey.expectedMovements().size());
        assertEquals(MovementEventType.PLANNED_DEPARTURE, journey.expectedMovements().get(0).expectedEventType());
    }

    @Test
    void reconcilesExpectedMovementsForNewerBookingRevisionOnly() {
        ContainerJourney journey = journey();

        ContainerJourney reconciled = journey.reconcileBookingRevision(2, List.of("SGSIN", "AEJEA", "NLRTM"), now.plusSeconds(60));
        ContainerJourney stale = reconciled.reconcileBookingRevision(1, List.of("SGSIN", "NLRTM"), now.plusSeconds(120));

        assertEquals(2, reconciled.bookingRevision());
        assertEquals(3, reconciled.expectedMovements().size());
        assertEquals(reconciled, stale);
    }

    @Test
    void capturesMovementsAndDerivesStatus() {
        ContainerJourney journey = journey()
                .capture(event("event-1", MovementEventType.ACTUAL_DEPARTURE, "SGSIN", "dedupe-1", now))
                .capture(event("event-2", MovementEventType.ACTUAL_ARRIVAL, "NLRTM", "dedupe-2", now.plusSeconds(60)));

        assertEquals(MovementStatus.ARRIVED, journey.status());
        assertEquals(2, journey.history().size());
    }

    @Test
    void rejectsDuplicateAndOutOfOrderMovementEvents() {
        ContainerJourney journey = journey()
                .capture(event("event-1", MovementEventType.ACTUAL_DEPARTURE, "SGSIN", "dedupe-1", now));

        assertThrows(IllegalArgumentException.class,
                () -> journey.capture(event("event-duplicate", MovementEventType.ACTUAL_DEPARTURE, "SGSIN", "dedupe-1", now.plusSeconds(30))));
        assertThrows(IllegalArgumentException.class,
                () -> journey.capture(event("event-old", MovementEventType.ACTUAL_ARRIVAL, "NLRTM", "dedupe-2", now.minusSeconds(30))));
    }

    private ContainerJourney journey() {
        return ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "container-1",
                List.of("SGSIN", "NLRTM"), now);
    }

    private MovementEvent event(String id, MovementEventType type, String location, String dedupe, Instant time) {
        return new MovementEvent(id, type, "container-1", location, time, new DedupeKey(dedupe), "corr-1");
    }
}
