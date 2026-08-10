package com.linercore.platform.containermovement.messaging;

import com.linercore.platform.containermovement.applicationservice.port.EventPublicationException;
import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.domain.outbox.BrokerMetadata;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;

public class KafkaContainerMovementEventPublisher implements MovementEventPublisherPort {
    private final KafkaGenericRecordPublisher publisher;
    private final AvroSchemaRepository schemas;
    private final String topic;

    public KafkaContainerMovementEventPublisher(
            KafkaGenericRecordPublisher publisher,
            AvroSchemaRepository schemas,
            String topic) {
        this.publisher = publisher;
        this.schemas = schemas;
        this.topic = topic;
    }

    @Override
    public BrokerMetadata publish(MovementStatusEvent event) {
        GenericRecord record = toGenericRecord(schemas.schemaFor(event.eventType()), event);
        try {
            com.linercore.platform.messaging.BrokerMetadata metadata =
                    publisher.publish(topic, event.bookingId() + ":" + event.containerId(), record);
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), metadata.publishedAt());
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }

    static GenericRecord toGenericRecord(Schema schema, MovementStatusEvent event) {
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
        data.put("bookingRef", payload.get("data.bookingRef"));
        data.put("containerRef", payload.get("data.containerRef"));
        data.put("movementId", blankToNull(payload.get("data.movementId")));
        data.put("sequenceNumber", Integer.parseInt(payload.getOrDefault("data.sequenceNumber", "0")));
        data.put("moveCode", payload.get("data.moveCode"));
        data.put("eventClassifierCode", payload.get("data.eventClassifierCode"));
        data.put("occurredDateTime", payload.get("data.occurredDateTime"));
        data.put("receivedDateTime", payload.get("data.receivedDateTime"));
        data.put("derivedStatus", payload.get("data.derivedStatus"));
        data.put("emptyIndicatorCode", payload.get("data.emptyIndicatorCode"));
        data.put("transshipment", Boolean.parseBoolean(payload.get("data.transshipment")));
        data.put("location", locationRecord(dataSchema, payload));
        record.put("data", data);
        return record;
    }

    private static GenericRecord locationRecord(Schema dataSchema, Map<String, String> payload) {
        if (!"true".equals(payload.get("data.location.present"))) {
            return null;
        }
        Schema locationSchema = dataSchema.getField("location").schema().getTypes().get(1);
        GenericRecord location = new GenericData.Record(locationSchema);
        location.put("unLocationCode", blankToNull(payload.get("data.location.unLocationCode")));
        location.put("facilityCode", blankToNull(payload.get("data.location.facilityCode")));
        location.put("facilityTypeCode", blankToNull(payload.get("data.location.facilityTypeCode")));
        return location;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
