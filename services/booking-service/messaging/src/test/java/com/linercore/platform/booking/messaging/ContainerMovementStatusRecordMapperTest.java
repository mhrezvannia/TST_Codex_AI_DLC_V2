package com.linercore.platform.booking.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.messaging.AvroSchemaRepository;
import java.nio.file.Path;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.Test;

class ContainerMovementStatusRecordMapperTest {
    private final Schema schema = new AvroSchemaRepository("avro", Path.of("contracts", "avro"))
            .schemaFor("containermovement.status");
    private final ContainerMovementStatusRecordMapper mapper = new ContainerMovementStatusRecordMapper();

    @Test
    void mapsCanonicalStatusRecord() {
        var event = mapper.map(record(), "booking-1:MSCU6639870");

        assertEquals("evt-status-1", event.eventId());
        assertEquals("booking-1", event.bookingRef());
        assertEquals("MSCU6639870", event.containerRef());
        assertEquals("LOAD", event.moveCode());
        assertEquals("ACT", event.eventClassifierCode());
        assertEquals("USNYC", event.location().unLocationCode());
    }

    @Test
    void rejectsMismatchedRecordKey() {
        assertThrows(IllegalArgumentException.class, () -> mapper.map(record(), "booking-1:OTHER"));
    }

    private GenericRecord record() {
        GenericRecord root = new GenericData.Record(schema);
        root.put("id", "evt-status-1");
        root.put("source", "container-movement-service");
        root.put("type", "containermovement.status");
        root.put("time", "2026-07-13T00:00:00Z");
        root.put("correlationId", "corr-1");
        root.put("dataSchemaVersion", 1);
        Schema dataSchema = schema.getField("data").schema();
        GenericRecord data = new GenericData.Record(dataSchema);
        data.put("bookingRef", "booking-1");
        data.put("containerRef", "MSCU6639870");
        data.put("movementId", "movement-1");
        data.put("moveCode", "LOAD");
        data.put("eventClassifierCode", "ACT");
        data.put("occurredDateTime", "2026-07-13T00:00:00Z");
        data.put("receivedDateTime", "2026-07-13T00:00:01Z");
        data.put("derivedStatus", "IN_TRANSIT");
        data.put("emptyIndicatorCode", "LADEN");
        data.put("transshipment", false);
        Schema locationSchema = dataSchema.getField("location").schema().getTypes().get(1);
        GenericRecord location = new GenericData.Record(locationSchema);
        location.put("unLocationCode", "USNYC");
        location.put("facilityCode", "PIER1");
        location.put("facilityTypeCode", "POTE");
        data.put("location", location);
        root.put("data", data);
        return root;
    }
}
