package com.linercore.platform.chargeagreement.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.OutboxStatus;
import com.linercore.platform.messaging.AvroSchemaRepository;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroDeserializerConfig;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.Schema;
import org.junit.jupiter.api.Test;

class KafkaAgreementEventPublisherSerdeTest {
    private static final String EVENT_TYPE = "charge-agreement.approved";
    private static final String TOPIC = "charge-agreement.events";

    @Test
    void productionRecordRoundTripsEveryContractField() {
        Instant occurredAt = Instant.parse("2026-07-13T00:00:00Z");
        Map<String, String> payload = Map.of(
                "eventId", "evt-agreement-1",
                "eventType", EVENT_TYPE,
                "schemaVersion", "1.0.0",
                "source", "charge-agreement-service",
                "occurredAt", occurredAt.toString(),
                "correlationId", "corr-1",
                "idempotencyKey", "agreement-1:3:" + EVENT_TYPE,
                "agreementId", "agreement-1",
                "agreementStatus", "APPROVED",
                "agreementVersion", "3");
        AgreementOutboxEvent event = new AgreementOutboxEvent(
                "evt-agreement-1", EVENT_TYPE, "1.0.0", "agreement-1", "APPROVED", 3,
                EVENT_TYPE + "-value", "charge-agreement-service",
                "agreement-1:3:" + EVENT_TYPE, "corr-1", occurredAt, payload,
                OutboxStatus.PENDING, 0, null, null, null, null, null);

        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));
        GenericRecord produced = KafkaAgreementEventPublisher.toGenericRecord(schemas.schemaFor(EVENT_TYPE), event);

        MockSchemaRegistryClient registry = new MockSchemaRegistryClient();
        Map<String, Object> config = Map.of(
                AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "mock://agreement-serde-test");
        GenericRecord received;
        byte[] wire;
        try (KafkaAvroSerializer serializer = new KafkaAvroSerializer(registry);
                KafkaAvroDeserializer deserializer = new KafkaAvroDeserializer(registry)) {
            serializer.configure(config, false);
            Map<String, Object> deserializeConfig = new HashMap<>(config);
            deserializeConfig.put(KafkaAvroDeserializerConfig.SPECIFIC_AVRO_READER_CONFIG, false);
            deserializer.configure(deserializeConfig, false);
            wire = serializer.serialize(TOPIC, produced);
            received = (GenericRecord) deserializer.deserialize(TOPIC, wire);
        }

        assertEquals(0, wire[0]);
        assertEquals("evt-agreement-1", string(received, "eventId"));
        assertEquals(EVENT_TYPE, string(received, "eventType"));
        assertEquals("1.0.0", string(received, "schemaVersion"));
        assertEquals("charge-agreement-service", string(received, "source"));
        assertEquals(occurredAt.toString(), string(received, "occurredAt"));
        assertEquals("corr-1", string(received, "correlationId"));
        assertEquals("agreement-1:3:" + EVENT_TYPE, string(received, "idempotencyKey"));
        assertEquals("agreement-1", string(received, "agreementId"));
        assertEquals("APPROVED", string(received, "agreementStatus"));
        assertEquals(3L, received.get("agreementVersion"));
        assertEquals(null, received.get("agreementVersionId"));
    }

    @Test
    void w2RecordAddsOnlyLifecycleIdentityAndOldSchemaStillMaps() {
        Instant occurredAt = Instant.parse("2026-07-28T00:00:00Z");
        AgreementOutboxEvent event = new AgreementOutboxEvent(
                "w2agr-1", EVENT_TYPE, "1.1.0", "agreement-1", "APPROVED", 4,
                EVENT_TYPE + "-value", "charge-agreement-service",
                "agreement-1:version-2:4:" + EVENT_TYPE, "corr-w2", occurredAt,
                Map.of(
                        "agreementVersionId", "version-2",
                        "agreementVersionNo", "2",
                        "authorityModel", "W2_VERSIONED",
                        "lifecycleAction", "APPROVED"),
                OutboxStatus.PENDING, 0, occurredAt, null, null, null, null);
        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));

        GenericRecord w2 = KafkaAgreementEventPublisher.toGenericRecord(
                schemas.schemaFor(EVENT_TYPE), event);
        assertEquals("version-2", string(w2, "agreementVersionId"));
        assertEquals(2L, w2.get("agreementVersionNo"));
        assertEquals("W2_VERSIONED", string(w2, "authorityModel"));
        assertEquals("APPROVED", string(w2, "lifecycleAction"));
        assertEquals(null, w2.get("sourceAgreementVersionId"));

        Schema oldSchema = new Schema.Parser().parse("""
                {"type":"record","name":"OldAgreementLifecycle","fields":[
                  {"name":"eventId","type":"string"},
                  {"name":"eventType","type":"string"},
                  {"name":"schemaVersion","type":"string"},
                  {"name":"source","type":"string"},
                  {"name":"occurredAt","type":"string"},
                  {"name":"correlationId","type":"string"},
                  {"name":"idempotencyKey","type":"string"},
                  {"name":"agreementId","type":"string"},
                  {"name":"agreementStatus","type":"string"},
                  {"name":"agreementVersion","type":"long"}]}
                """);
        GenericRecord old = KafkaAgreementEventPublisher.toGenericRecord(oldSchema, event);
        assertEquals("w2agr-1", string(old, "eventId"));
        assertEquals(4L, old.get("agreementVersion"));
    }

    private String string(GenericRecord record, String field) {
        return record.get(field).toString();
    }
}
