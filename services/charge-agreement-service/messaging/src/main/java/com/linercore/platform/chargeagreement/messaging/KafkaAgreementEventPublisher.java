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
        record.put("eventId", event.eventId());
        record.put("eventType", event.eventType());
        record.put("schemaVersion", event.schemaVersion());
        record.put("source", event.producerIdentity());
        record.put("occurredAt", event.occurredAt().toString());
        record.put("correlationId", event.correlationId());
        record.put("idempotencyKey", event.deduplicationKey());
        record.put("agreementId", event.agreementId());
        record.put("agreementStatus", event.agreementStatus());
        record.put("agreementVersion", event.agreementVersion());
        optional(schema, record, "agreementVersionId", payload.get("agreementVersionId"));
        optionalLong(schema, record, "agreementVersionNo", payload.get("agreementVersionNo"));
        optional(schema, record, "authorityModel", payload.get("authorityModel"));
        optional(schema, record, "sourceAgreementVersionId", payload.get("sourceAgreementVersionId"));
        optional(schema, record, "lifecycleAction", payload.get("lifecycleAction"));
        return record;
    }

    private static void optional(Schema schema, GenericRecord record, String field, String value) {
        if (schema.getField(field) != null) {
            record.put(field, value);
        }
    }

    private static void optionalLong(Schema schema, GenericRecord record, String field, String value) {
        if (schema.getField(field) != null) {
            record.put(field, value == null ? null : Long.parseLong(value));
        }
    }
}
