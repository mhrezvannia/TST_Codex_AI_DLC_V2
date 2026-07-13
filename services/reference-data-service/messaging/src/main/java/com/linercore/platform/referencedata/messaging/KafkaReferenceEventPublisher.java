package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;

/**
 * Reference-data adapter over the shared {@link KafkaGenericRecordPublisher}: maps the domain event
 * to its Avro record and translates shared results/failures back to the reference-data port types.
 */
public class KafkaReferenceEventPublisher implements ReferenceEventPublisherPort {
    private final KafkaGenericRecordPublisher publisher;
    private final AvroSchemaRepository schemas;
    private final String topic;

    public KafkaReferenceEventPublisher(KafkaGenericRecordPublisher publisher, AvroSchemaRepository schemas, String topic) {
        this.publisher = publisher;
        this.schemas = schemas;
        this.topic = topic;
    }

    @Override
    public BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        GenericRecord record = toGenericRecord(schemas.schemaFor(envelope.eventType()), envelope, payload);
        try {
            com.linercore.platform.messaging.BrokerMetadata meta =
                    publisher.publish(topic, envelope.entityId(), record);
            return new BrokerMetadata(meta.topic(), meta.partition(), meta.offset(), meta.publishedAt());
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }

    // Package-private + static so the Avro field-mapping can be verified directly in tests
    // (round-tripped through the real Confluent serializer + Schema Registry).
    static GenericRecord toGenericRecord(Schema schema, ReferenceEventEnvelope envelope, Map<String, String> payload) {
        GenericRecord record = new GenericData.Record(schema);
        record.put("eventId", envelope.eventId());
        record.put("eventType", envelope.eventType());
        record.put("schemaVersion", envelope.schemaVersion());
        record.put("source", envelope.source());
        record.put("occurredAt", envelope.occurredAt().toString());
        record.put("correlationId", envelope.correlationId());
        record.put("entityId", envelope.entityId());
        record.put("operation", envelope.operation().name());
        record.put("producer", envelope.producer());
        record.put("payload", payload);
        return record;
    }
}
