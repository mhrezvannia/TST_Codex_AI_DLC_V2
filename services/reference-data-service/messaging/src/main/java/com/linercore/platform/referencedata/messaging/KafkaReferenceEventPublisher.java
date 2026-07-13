package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

public class KafkaReferenceEventPublisher implements ReferenceEventPublisherPort {
    private final KafkaTemplate<String, GenericRecord> kafka;
    private final AvroSchemaRepository schemas;
    private final String topic;
    private final Clock clock;

    public KafkaReferenceEventPublisher(
            KafkaTemplate<String, GenericRecord> kafka,
            AvroSchemaRepository schemas,
            String topic,
            Clock clock) {
        this.kafka = kafka;
        this.schemas = schemas;
        this.topic = topic;
        this.clock = clock;
    }

    public BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        GenericRecord record = toGenericRecord(schemas.schemaFor(envelope.eventType()), envelope, payload);
        try {
            SendResult<String, GenericRecord> result = kafka.send(topic, envelope.entityId(), record).get(10, TimeUnit.SECONDS);
            RecordMetadata metadata = result.getRecordMetadata();
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), Instant.now(clock));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new EventPublicationException("KAFKA_PUBLISH_INTERRUPTED", ex.getMessage(), true);
        } catch (ExecutionException | TimeoutException ex) {
            throw new EventPublicationException("KAFKA_PUBLISH_FAILED", rootMessage(ex), true);
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

    private String rootMessage(Exception ex) {
        Throwable cause = ex.getCause();
        return cause == null || cause.getMessage() == null ? ex.getMessage() : cause.getMessage();
    }
}
