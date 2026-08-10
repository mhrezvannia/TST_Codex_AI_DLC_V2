package com.linercore.platform.chargeagreement.messaging;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.EventPublicationException;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.BrokerMetadata;
import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;

public class KafkaAgreementEventPublisher implements AgreementEventPublisherPort {
    private final KafkaGenericRecordPublisher publisher;
    private final AvroSchemaRepository schemas;
    private final String topic;

    public KafkaAgreementEventPublisher(
            KafkaGenericRecordPublisher publisher,
            AvroSchemaRepository schemas,
            String topic) {
        this.publisher = publisher;
        this.schemas = schemas;
        this.topic = topic;
    }

    @Override
    public BrokerMetadata publish(AgreementOutboxEvent event) {
        GenericRecord record = toGenericRecord(schemas.schemaFor(event.eventType()), event);
        try {
            com.linercore.platform.messaging.BrokerMetadata metadata =
                    publisher.publish(topic, event.agreementId(), record);
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), metadata.publishedAt());
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }

    static GenericRecord toGenericRecord(Schema schema, AgreementOutboxEvent event) {
        Map<String, String> payload = event.payload();
        GenericRecord record = new GenericData.Record(schema);
        record.put("eventId", payload.get("eventId"));
        record.put("eventType", payload.get("eventType"));
        record.put("schemaVersion", payload.get("schemaVersion"));
        record.put("source", payload.get("source"));
        record.put("occurredAt", payload.get("occurredAt"));
        record.put("correlationId", payload.get("correlationId"));
        record.put("idempotencyKey", payload.get("idempotencyKey"));
        record.put("agreementId", payload.get("agreementId"));
        record.put("agreementStatus", payload.get("agreementStatus"));
        record.put("agreementVersion", Long.parseLong(payload.get("agreementVersion")));
        return record;
    }
}
