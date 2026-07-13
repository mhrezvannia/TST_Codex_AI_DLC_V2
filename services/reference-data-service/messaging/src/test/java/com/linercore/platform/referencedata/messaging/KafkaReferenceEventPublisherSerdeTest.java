package com.linercore.platform.referencedata.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroDeserializerConfig;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.Test;

/**
 * Proves the reference-data event serialization contract for real — no placeholder.
 *
 * <p>The exact production record-building ({@link KafkaReferenceEventPublisher#toGenericRecord}) is
 * serialized through the real Confluent {@link KafkaAvroSerializer} against a Schema Registry, then
 * deserialized back, and every field (including the payload map) is asserted. This exercises schema
 * loading, Avro (de)serialization, and Schema-Registry registration end to end in-JVM.
 *
 * <p>Scope note: the Schema Registry here is Confluent's in-memory {@link MockSchemaRegistryClient}
 * (a real implementation, not a stub) and there is no network broker hop — that final hop onto a
 * live Kafka topic is covered by the Docker Compose live-proof in W0-01's Definition of Done. An
 * embedded-broker variant was attempted but this CI/sandbox environment blocks loopback TCP
 * (both KRaft and ZooKeeper embedded brokers fail to bind localhost).
 */
class KafkaReferenceEventPublisherSerdeTest {

    private static final String TOPIC = "referencedata.events";
    private static final String EVENT_TYPE = "referencedata.currency.changed";
    private static final String MOCK_REGISTRY = "mock://reference-data-serde-test";

    @Test
    void productionRecordSerializesAndDeserializesThroughSchemaRegistry() {
        // The real schema the publisher would use, loaded the same way (classpath avro/*.avsc).
        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));
        Schema schema = schemas.schemaFor(EVENT_TYPE);
        assertNotNull(schema, "reference-data currency-changed schema must load");

        ReferenceEventEnvelope envelope = new ReferenceEventEnvelope(
                "evt-1", EVENT_TYPE, "1.0.0", "reference-data-service",
                Instant.parse("2026-07-13T00:00:00Z"), "corr-1", "currency-usd",
                ReferenceOperation.CREATED, "reference-data-service");
        Map<String, String> payload = Map.of("code", "USD", "status", "ACTIVE");

        // The actual production field-mapping.
        GenericRecord produced = KafkaReferenceEventPublisher.toGenericRecord(schema, envelope, payload);

        // Round-trip through a REAL Confluent Avro serializer + Schema Registry (in-memory).
        SchemaRegistryClient registry = new MockSchemaRegistryClient();
        Map<String, Object> config = Map.of(AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, MOCK_REGISTRY);
        byte[] wire;
        GenericRecord received;
        try (KafkaAvroSerializer serializer = new KafkaAvroSerializer(registry);
                KafkaAvroDeserializer deserializer = new KafkaAvroDeserializer(registry)) {
            serializer.configure(config, false);
            Map<String, Object> deConfig = new HashMap<>(config);
            deConfig.put(KafkaAvroDeserializerConfig.SPECIFIC_AVRO_READER_CONFIG, false);
            deserializer.configure(deConfig, false);

            wire = serializer.serialize(TOPIC, produced);
            received = (GenericRecord) deserializer.deserialize(TOPIC, wire);
        }

        // The wire bytes carry the Confluent magic byte + schema id (proves SR registration happened).
        assertEquals(0, wire[0], "Confluent wire format magic byte");

        assertEquals("evt-1", received.get("eventId").toString());
        assertEquals(EVENT_TYPE, received.get("eventType").toString());
        assertEquals("1.0.0", received.get("schemaVersion").toString());
        assertEquals("reference-data-service", received.get("source").toString());
        assertEquals("corr-1", received.get("correlationId").toString());
        assertEquals("currency-usd", received.get("entityId").toString());
        assertEquals("CREATED", received.get("operation").toString());
        assertEquals("reference-data-service", received.get("producer").toString());

        Map<String, String> receivedPayload = new HashMap<>();
        ((Map<?, ?>) received.get("payload")).forEach((k, v) -> receivedPayload.put(k.toString(), v.toString()));
        assertEquals("USD", receivedPayload.get("code"));
        assertEquals("ACTIVE", receivedPayload.get("status"));
    }
}
