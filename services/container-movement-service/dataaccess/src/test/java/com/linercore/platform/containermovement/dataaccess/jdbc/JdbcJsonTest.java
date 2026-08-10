package com.linercore.platform.containermovement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.EquipmentEventTypeCode;
import com.linercore.platform.containermovement.domain.model.EventClassifierCode;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class JdbcJsonTest {
    private final JdbcJson json = new JdbcJson(new ObjectMapper());

    @Test
    void upcastsLegacyExpectedMovementFieldsInFullJourneySnapshot() {
        String legacySnapshot = """
                {
                  "id":{"value":"journey-legacy"},
                  "bookingId":"booking-1",
                  "bookingRevision":1,
                  "containerId":"MSCU6639870",
                  "status":"ALLOCATED",
                  "expectedMovements":[
                    {
                      "sequence":"1",
                      "expectedEventType":"PLANNED_DEPARTURE",
                      "locationId":"SGSIN"
                    },
                    {
                      "sequence":"2",
                      "expectedEventType":"ESTIMATED_ARRIVAL",
                      "locationId":"NLRTM"
                    }
                  ],
                  "history":[],
                  "updatedAt":"2026-07-01T00:00:00Z"
                }
                """;

        ContainerJourney journey = json.read(legacySnapshot, ContainerJourney.class);

        assertEquals(EventClassifierCode.PLN, journey.expectedMovements().get(0).eventClassifierCode());
        assertEquals(EquipmentEventTypeCode.LOAD, journey.expectedMovements().get(0).moveCode());
        assertEquals("SGSIN", journey.expectedMovements().get(0).locationId());
        assertEquals(EventClassifierCode.PLN, journey.expectedMovements().get(1).eventClassifierCode());
        assertEquals(EquipmentEventTypeCode.DISC, journey.expectedMovements().get(1).moveCode());
        assertEquals("NLRTM", journey.expectedMovements().get(1).locationId());
    }

    @Test
    void roundTripsCurrentCanonicalJourneySnapshot() {
        ContainerJourney expected = ContainerJourney.create(
                new JourneyId("journey-current"),
                "booking-1",
                "MSCU6639870",
                List.of("SGSIN", "NLRTM"),
                Instant.parse("2026-07-01T00:00:00Z"));

        String snapshot = json.write(expected);
        ContainerJourney actual = json.read(snapshot, ContainerJourney.class);

        assertEquals(expected, actual);
        assertFalse(snapshot.contains("expectedEventType"));
    }

    @Test
    void rejectsUnsupportedLegacyExpectedMovementType() {
        String invalidLegacySnapshot = """
                {
                  "id":{"value":"journey-invalid"},
                  "bookingId":"booking-1",
                  "bookingRevision":1,
                  "containerId":"MSCU6639870",
                  "status":"ALLOCATED",
                  "expectedMovements":[
                    {
                      "sequence":"1",
                      "expectedEventType":"ACT_LOAD",
                      "locationId":"SGSIN"
                    }
                  ],
                  "history":[],
                  "updatedAt":"2026-07-01T00:00:00Z"
                }
                """;

        assertThrows(IllegalStateException.class,
                () -> json.read(invalidLegacySnapshot, ContainerJourney.class));
    }
}
