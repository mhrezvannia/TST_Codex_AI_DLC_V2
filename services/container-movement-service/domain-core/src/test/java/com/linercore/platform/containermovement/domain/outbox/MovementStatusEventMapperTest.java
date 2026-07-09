package com.linercore.platform.containermovement.domain.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.DedupeKey;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import com.linercore.platform.containermovement.domain.model.MovementEventType;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class MovementStatusEventMapperTest {
    @Test
    void mapsJourneyStatusToOutboxEvidence() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        ContainerJourney journey = ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "container-1",
                List.of("SGSIN", "NLRTM"), now)
                .capture(new MovementEvent("event-1", MovementEventType.ACTUAL_DEPARTURE, "container-1", "SGSIN",
                        now, new DedupeKey("dedupe-1"), "corr-1"));

        MovementStatusEvent event = new MovementStatusEventMapper().statusEvent("status-event-1", journey, "corr-1", now);

        assertEquals("containermovement.status", event.eventType());
        assertEquals("containermovement.status-value", event.schemaSubject());
        assertEquals("container-movement-service", event.producerIdentity());
        assertEquals("booking-1", event.bookingId());
        assertEquals("corr-1", event.correlationId());
    }
}
