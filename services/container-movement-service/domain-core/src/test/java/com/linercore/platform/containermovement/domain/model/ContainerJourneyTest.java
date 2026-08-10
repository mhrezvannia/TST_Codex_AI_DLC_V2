package com.linercore.platform.containermovement.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class ContainerJourneyTest {
    private final Instant now = Instant.parse("2026-07-01T00:00:00Z");

    @Test
    void createsExpectedMovementsFromRouteFacts() {
        ContainerJourney journey = journey();

        assertEquals(MovementStatus.ALLOCATED, journey.status());
        assertEquals(1, journey.bookingRevision());
        assertEquals(2, journey.expectedMovements().size());
        assertEquals(EventClassifierCode.PLN, journey.expectedMovements().get(0).eventClassifierCode());
        assertEquals(EquipmentEventTypeCode.LOAD, journey.expectedMovements().get(0).moveCode());
        assertEquals("SGSIN", journey.expectedMovements().get(0).locationId());
        assertEquals(EventClassifierCode.PLN, journey.expectedMovements().get(1).eventClassifierCode());
        assertEquals(EquipmentEventTypeCode.DISC, journey.expectedMovements().get(1).moveCode());
        assertEquals("NLRTM", journey.expectedMovements().get(1).locationId());
    }

    @Test
    void reconcilesExpectedMovementsForNewerBookingRevisionOnly() {
        ContainerJourney journey = journey();

        ContainerJourney reconciled = journey.reconcileBookingRevision(2, List.of("SGSIN", "AEJEA", "NLRTM"), now.plusSeconds(60));
        ContainerJourney stale = reconciled.reconcileBookingRevision(1, List.of("SGSIN", "NLRTM"), now.plusSeconds(120));

        assertEquals(2, reconciled.bookingRevision());
        assertEquals(2, reconciled.expectedMovements().size());
        assertEquals("SGSIN", reconciled.expectedMovements().get(0).locationId());
        assertEquals("NLRTM", reconciled.expectedMovements().get(1).locationId());
        assertEquals(reconciled, stale);
    }

    @Test
    void capturesCanonicalMovementSequenceAndDerivesLifecycle() {
        ContainerJourney gatedOut = journey()
                .capture(event("event-1", MovementEventType.ACT_GTOT, "SGSIN", "dedupe-1", now));
        ContainerJourney inTransit = gatedOut
                .capture(event("event-2", MovementEventType.ACT_LOAD, "SGSIN", "dedupe-2", now.plusSeconds(60)));
        ContainerJourney discharged = inTransit
                .capture(event("event-3", MovementEventType.ACT_DISC, "NLRTM", "dedupe-3", now.plusSeconds(120)));
        ContainerJourney returnedEmpty = discharged
                .capture(event("event-4", MovementEventType.ACT_GTIN, "NLRTM", "dedupe-4", now.plusSeconds(180)));

        assertEquals(MovementStatus.GATED_OUT, gatedOut.status());
        assertEquals(MovementStatus.IN_TRANSIT, inTransit.status());
        assertEquals(MovementStatus.DISCHARGED, discharged.status());
        assertEquals(MovementStatus.RETURNED_EMPTY, returnedEmpty.status());
        assertEquals("NONE", returnedEmpty.requiredNextMove());
        assertEquals(4, returnedEmpty.history().size());
    }

    @Test
    void rejectsDuplicateOccurrenceAndWrongNextMovement() {
        ContainerJourney journey = journey()
                .capture(event("event-1", MovementEventType.ACT_GTOT, "SGSIN", "dedupe-1", now));

        assertThrows(IllegalArgumentException.class,
                () -> journey.capture(event("event-duplicate", MovementEventType.ACT_GTOT, "SGSIN", "dedupe-2", now)));
        assertThrows(IllegalArgumentException.class,
                () -> journey.capture(event("event-old", MovementEventType.ACT_DISC, "NLRTM", "dedupe-2", now.minusSeconds(30))));
        assertThrows(IllegalArgumentException.class,
                () -> journey.capture(event("event-wrong-next", MovementEventType.ACT_DISC, "NLRTM", "dedupe-3", now.plusSeconds(30))));
    }

    @Test
    void rejectsAnyFutureOccurrenceAgainstInjectedClockWithoutSkew() {
        Clock clock = Clock.fixed(now, ZoneOffset.UTC);

        assertThrows(IllegalArgumentException.class,
                () -> journey().capture(
                        event("event-future", MovementEventType.ACT_GTOT, "SGSIN", "dedupe-1", now.plusMillis(1)),
                        clock));
    }

    private ContainerJourney journey() {
        return ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "container-1",
                List.of("SGSIN", "NLRTM"), now);
    }

    private MovementEvent event(String id, MovementEventType type, String location, String dedupe, Instant time) {
        return new MovementEvent(id, type, "container-1", location, time, new DedupeKey(dedupe), "corr-1");
    }
}
