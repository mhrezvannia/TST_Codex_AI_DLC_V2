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
        record.put("eventId", payload.get("eventId"));
        record.put("eventType", payload.get("eventType"));
        record.put("schemaVersion", payload.get("schemaVersion"));
        record.put("source", payload.get("source"));
        record.put("occurredAt", payload.get("occurredAt"));
        record.put("correlationId", payload.get("correlationId"));
        record.put("idempotencyKey", payload.get("idempotencyKey"));
        record.put("bookingId", payload.get("bookingId"));
        record.put("bookingRevision", Integer.parseInt(payload.get("bookingRevision")));
        record.put("pricingRef", payload.get("pricingRef"));
        record.put("customerId", payload.get("customerId"));
        record.put("originLocationId", payload.get("originLocationId"));
        record.put("destinationLocationId", payload.get("destinationLocationId"));
        record.put("containerId", payload.get("containerId"));
        record.put("equipmentTypeId", payload.get("equipmentTypeId"));
        return record;
    }
}
