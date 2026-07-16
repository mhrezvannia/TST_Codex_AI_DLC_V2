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
                    publisher.publish(topic, event.bookingId(), record);
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), metadata.publishedAt());
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }

    static GenericRecord toGenericRecord(Schema schema, MovementStatusEvent event) {
        Map<String, String> payload = event.payload();
        GenericRecord record = new GenericData.Record(schema);
        record.put("eventId", payload.get("eventId"));
        record.put("eventType", payload.get("eventType"));
        record.put("schemaVersion", payload.get("schemaVersion"));
        record.put("source", payload.get("source"));
        record.put("occurredAt", payload.get("occurredAt"));
        record.put("correlationId", payload.get("correlationId"));
        record.put("idempotencyKey", payload.get("idempotencyKey"));
        record.put("containerId", payload.get("containerId"));
        record.put("bookingId", payload.get("bookingId"));
        record.put("movementStatus", payload.get("movementStatus"));
        record.put("sequenceNumber", Long.parseLong(payload.get("sequenceNumber")));
        record.put("statusReason", payload.get("statusReason"));
        record.put("lastKnownLocationId", payload.get("lastKnownLocationId"));
        return record;
    }
}
