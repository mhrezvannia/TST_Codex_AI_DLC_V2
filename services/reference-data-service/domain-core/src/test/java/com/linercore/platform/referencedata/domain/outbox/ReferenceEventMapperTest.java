package com.linercore.platform.referencedata.domain.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReferenceEventMapperTest {
    @Test
    void mapsReferenceChangeFactToPendingOutboxEvent() {
        ReferenceChangedFact fact = new ReferenceChangedFact("change-1", ReferenceSet.CURRENCY, "id-1", "USD",
                ReferenceOperation.CREATED, Map.of("name", "US Dollar"), Map.of("code", "USD"),
                Instant.EPOCH, "corr-1");

        OutboxEvent event = new ReferenceEventMapper().toOutboxEvent("event-1", fact);

        assertEquals(OutboxStatus.PENDING, event.status());
        assertEquals("referencedata.currency.changed", event.eventType());
        assertEquals("reference-data-service", event.payload().get("producerIdentity"));
        assertEquals("referencedata.currency.changed-value", event.payload().get("schemaSubject"));
        assertEquals("CURRENCY:id-1:CREATED:change-1", event.payload().get("deduplicationKey"));
        assertEquals("corr-1", event.payload().get("correlationId"));
    }

    @Test
    void keepsPublishedVoyageEventNameForVesselVoyageSet() {
        ReferenceChangedFact fact = new ReferenceChangedFact("change-2", ReferenceSet.VESSEL_VOYAGE, "voyage-1", "LC001E",
                ReferenceOperation.CREATED, Map.of(), Map.of("carrierVoyageNumber", "LC001E"),
                Instant.EPOCH, "corr-2");

        OutboxEvent event = new ReferenceEventMapper().toOutboxEvent("event-2", fact);

        assertEquals("referencedata.voyage.changed", event.eventType());
        assertEquals("referencedata.voyage.changed-value", event.payload().get("schemaSubject"));
    }
}
