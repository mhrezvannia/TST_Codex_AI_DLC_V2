package com.linercore.platform.booking.messaging;

import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.EventPublicationException;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.BrokerMetadata;
import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;

public class KafkaBookingEventPublisher implements BookingEventPublisherPort {
    private final KafkaGenericRecordPublisher publisher;
    private final AvroSchemaRepository schemas;
    private final String topic;

    public KafkaBookingEventPublisher(
            KafkaGenericRecordPublisher publisher,
            AvroSchemaRepository schemas,
            String topic) {
        this.publisher = publisher;
        this.schemas = schemas;
        this.topic = topic;
    }

    @Override
    public BrokerMetadata publish(BookingOutboxEvent event) {
        GenericRecord record = toGenericRecord(schemas.schemaFor(event.eventType()), event);
        try {
            com.linercore.platform.messaging.BrokerMetadata metadata =
                    publisher.publish(topic, event.bookingId(), record);
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), metadata.publishedAt());
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }

    static GenericRecord toGenericRecord(Schema schema, BookingOutboxEvent event) {
        Map<String, String> payload = event.payload();
        GenericRecord record = new GenericData.Record(schema);
        record.put("id", payload.get("id"));
        record.put("source", payload.get("source"));
        record.put("type", payload.get("type"));
        record.put("time", payload.get("time"));
        record.put("correlationId", payload.get("correlationId"));
        record.put("dataSchemaVersion", Integer.parseInt(payload.get("dataSchemaVersion")));
        Schema dataSchema = schema.getField("data").schema();
        GenericRecord data = new GenericData.Record(dataSchema);
        data.put("bookingId", payload.get("data.bookingId"));
        data.put("bookingRevision", Integer.parseInt(payload.get("data.bookingRevision")));
        data.put("routing", routingRecords(dataSchema.getField("routing").schema(), payload));
        data.put("equipment", equipmentRecords(dataSchema.getField("equipment").schema(), payload));
        record.put("data", data);
        return record;
    }

    private static GenericData.Array<GenericRecord> routingRecords(Schema arraySchema, Map<String, String> payload) {
        int count = Integer.parseInt(payload.getOrDefault("data.routing.count", "0"));
        Schema itemSchema = arraySchema.getElementType();
        GenericData.Array<GenericRecord> records = new GenericData.Array<>(count, arraySchema);
        for (int index = 0; index < count; index++) {
            GenericRecord leg = new GenericData.Record(itemSchema);
            leg.put("legSequence", Integer.parseInt(payload.get("data.routing." + index + ".legSequence")));
            leg.put("loadUnLocode", payload.get("data.routing." + index + ".loadUnLocode"));
            leg.put("dischargeUnLocode", payload.get("data.routing." + index + ".dischargeUnLocode"));
            leg.put("voyageId", payload.get("data.routing." + index + ".voyageId"));
            records.add(leg);
        }
        return records;
    }

    private static GenericData.Array<GenericRecord> equipmentRecords(Schema arraySchema, Map<String, String> payload) {
        int count = Integer.parseInt(payload.getOrDefault("data.equipment.count", "0"));
        Schema itemSchema = arraySchema.getElementType();
        GenericData.Array<GenericRecord> records = new GenericData.Array<>(count, arraySchema);
        for (int index = 0; index < count; index++) {
            GenericRecord equipment = new GenericData.Record(itemSchema);
            equipment.put("equipmentTypeCode", payload.get("data.equipment." + index + ".equipmentTypeCode"));
            equipment.put("quantity", Integer.parseInt(payload.get("data.equipment." + index + ".quantity")));
            equipment.put("equipmentId", payload.get("data.equipment." + index + ".equipmentId"));
            records.add(equipment);
        }
        return records;
    }
}
