package com.linercore.platform.containermovement.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.containermovement.applicationservice.event.BookingConfirmedEvent;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.Test;

class BookingConfirmedRecordMapperTest {
    @Test
    void mapsCanonicalNestedAvroRecordToApplicationEvent() throws Exception {
        Schema schema;
        try (var input = getClass().getResourceAsStream("/avro/booking.confirmed.avsc")) {
            schema = new Schema.Parser().parse(input);
        }
        GenericRecord record = new GenericData.Record(schema);
        record.put("id", "8b472784-7636-5b18-8b9f-93414b33d72a");
        record.put("source", "booking-service");
        record.put("type", "booking.confirmed");
        record.put("time", "2026-07-13T00:00:00Z");
        record.put("correlationId", "corr-1");
        record.put("dataSchemaVersion", 1);

        Schema dataSchema = schema.getField("data").schema();
        GenericRecord data = new GenericData.Record(dataSchema);
        data.put("bookingId", "booking-1");
        data.put("bookingRevision", 3);

        Schema routingSchema = dataSchema.getField("routing").schema();
        GenericData.Array<GenericRecord> routing = new GenericData.Array<>(1, routingSchema);
        GenericRecord leg = new GenericData.Record(routingSchema.getElementType());
        leg.put("legSequence", 1);
        leg.put("loadUnLocode", "USNYC");
        leg.put("dischargeUnLocode", "NLRTM");
        leg.put("voyageId", "voyage-1");
        routing.add(leg);
        data.put("routing", routing);

        Schema equipmentSchema = dataSchema.getField("equipment").schema();
        GenericData.Array<GenericRecord> equipment = new GenericData.Array<>(1, equipmentSchema);
        GenericRecord assignment = new GenericData.Record(equipmentSchema.getElementType());
        assignment.put("equipmentTypeCode", "45G1");
        assignment.put("quantity", 1);
        assignment.put("equipmentId", "MSCU6639870");
        equipment.add(assignment);
        data.put("equipment", equipment);
        record.put("data", data);

        BookingConfirmedEvent event = new BookingConfirmedRecordMapper().toEvent(record);

        assertEquals("8b472784-7636-5b18-8b9f-93414b33d72a", event.eventId());
        assertEquals("booking.confirmed", event.eventType());
        assertEquals("booking-service", event.source());
        assertEquals(1, event.dataSchemaVersion());
        assertEquals("booking-1", event.bookingId());
        assertEquals(3, event.bookingRevision());
        assertEquals("USNYC", event.routing().get(0).loadUnLocode());
        assertEquals("MSCU6639870", event.equipment().get(0).equipmentId());
        assertEquals("MSCU6639870", event.journeyContainerId());
    }
}
