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
    void mapsActualGateOutToDcsaStatusEvidence() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        ContainerJourney journey = ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "MSCU6639870",
                List.of("SGSIN", "NLRTM"), now)
                .capture(new MovementEvent("event-1", MovementEventType.ACT_GTOT, "MSCU6639870", "SGSIN",
                        now, new DedupeKey("dedupe-1"), "corr-1"));

        MovementStatusEvent event = new MovementStatusEventMapper().statusEvent("status-event-1", journey, "corr-1", now);

        assertEquals("GTOT", event.payload().get("data.moveCode"));
        assertEquals("ACT", event.payload().get("data.eventClassifierCode"));
        assertEquals("GATED_OUT", event.payload().get("data.derivedStatus"));
        assertEquals("1", event.payload().get("data.sequenceNumber"));
        assertEquals("LADEN", event.payload().get("data.emptyIndicatorCode"));
    }

    @Test
    void mapsJourneyStatusToOutboxEvidence() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        ContainerJourney journey = ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "MSCU6639870",
                List.of("SGSIN", "NLRTM"), now)
                .capture(new MovementEvent("event-1", MovementEventType.ACT_GTOT, "MSCU6639870", "SGSIN",
                        now, new DedupeKey("dedupe-1"), "corr-1"))
                .capture(new MovementEvent("event-2", MovementEventType.ACT_LOAD, "MSCU6639870", "SGSIN",
                        now.plusSeconds(60), new DedupeKey("dedupe-2"), "corr-1"));

        MovementStatusEvent event = new MovementStatusEventMapper().statusEvent("status-event-1", journey, "corr-1", now);

        assertEquals("containermovement.status", event.eventType());
        assertEquals("containermovement.status-value", event.schemaSubject());
        assertEquals("container-movement-service", event.producerIdentity());
        assertEquals("booking-1", event.bookingId());
        assertEquals("corr-1", event.correlationId());
        assertEquals("container-movement-service", event.payload().get("source"));
        assertEquals("containermovement.status", event.payload().get("type"));
        assertEquals("booking-1", event.payload().get("data.bookingRef"));
        assertEquals("MSCU6639870", event.payload().get("data.containerRef"));
        assertEquals("LOAD", event.payload().get("data.moveCode"));
        assertEquals("ACT", event.payload().get("data.eventClassifierCode"));
        assertEquals("IN_TRANSIT", event.payload().get("data.derivedStatus"));
        assertEquals("SGSIN", event.payload().get("data.location.unLocationCode"));
    }

    @Test
    void mapsReturnedEmptyFromAcceptedGtinState() {
        Instant now = Instant.parse("2026-07-01T00:00:00Z");
        ContainerJourney journey = ContainerJourney.create(new JourneyId("journey-1"), "booking-1", "MSCU6639870",
                        List.of("SGSIN", "NLRTM"), now)
                .capture(new MovementEvent("event-1", MovementEventType.ACT_GTOT, "MSCU6639870", "SGSIN",
                        now, new DedupeKey("dedupe-1"), "corr-1"))
                .capture(new MovementEvent("event-2", MovementEventType.ACT_LOAD, "MSCU6639870", "SGSIN",
                        now, new DedupeKey("dedupe-2"), "corr-1"))
                .capture(new MovementEvent("event-3", MovementEventType.ACT_DISC, "MSCU6639870", "NLRTM",
                        now, new DedupeKey("dedupe-3"), "corr-1"))
                .capture(new MovementEvent("event-4", MovementEventType.ACT_GTIN, "MSCU6639870", "NLRTM",
                        now, new DedupeKey("dedupe-4"), "corr-1"));

        MovementStatusEvent event = new MovementStatusEventMapper().statusEvent("status-event-4", journey, "corr-1", now);

        assertEquals("GTIN", event.payload().get("data.moveCode"));
        assertEquals("ACT", event.payload().get("data.eventClassifierCode"));
        assertEquals("4", event.payload().get("data.sequenceNumber"));
        assertEquals("RETURNED_EMPTY", event.payload().get("data.derivedStatus"));
        assertEquals("EMPTY", event.payload().get("data.emptyIndicatorCode"));
    }
}
