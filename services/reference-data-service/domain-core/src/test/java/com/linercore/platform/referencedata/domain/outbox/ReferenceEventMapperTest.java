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
    }
}
