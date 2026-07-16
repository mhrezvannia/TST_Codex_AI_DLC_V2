package com.linercore.platform.containermovement.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.containermovement.domain.model.MovementStatus;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import com.linercore.platform.containermovement.domain.outbox.OutboxStatus;
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
import org.junit.jupiter.api.Test;

class KafkaContainerMovementEventPublisherSerdeTest {
    private static final String EVENT_TYPE = "containermovement.status";
    private static final String TOPIC = "containermovement.events";

    @Test
    void productionRecordRoundTripsEveryContractField() {
        Instant occurredAt = Instant.parse("2026-07-13T00:00:00Z");
        Map<String, String> payload = Map.ofEntries(
                Map.entry("eventId", "evt-movement-1"),
                Map.entry("eventType", EVENT_TYPE),
                Map.entry("schemaVersion", "1.0.0"),
                Map.entry("source", "container-movement-service"),
                Map.entry("occurredAt", occurredAt.toString()),
                Map.entry("correlationId", "corr-1"),
                Map.entry("idempotencyKey", "journey-1:IN_TRANSIT:4"),
                Map.entry("journeyId", "journey-1"),
                Map.entry("containerId", "container-1"),
                Map.entry("bookingId", "booking-1"),
                Map.entry("movementStatus", "IN_TRANSIT"),
                Map.entry("sequenceNumber", "4"),
                Map.entry("statusReason", "Validated movement GATE_OUT"),
                Map.entry("lastKnownLocationId", "location-1"));
        MovementStatusEvent event = new MovementStatusEvent(
                "evt-movement-1", EVENT_TYPE, "1.0.0", "journey-1", "booking-1",
                "container-1", MovementStatus.IN_TRANSIT, EVENT_TYPE + "-value",
                "container-movement-service", "journey-1:IN_TRANSIT:4", "corr-1", occurredAt,
                payload, OutboxStatus.PENDING, 0, null, null, null, null, null);

        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));
        GenericRecord produced = KafkaContainerMovementEventPublisher.toGenericRecord(
                schemas.schemaFor(EVENT_TYPE), event);

        MockSchemaRegistryClient registry = new MockSchemaRegistryClient();
        Map<String, Object> config = Map.of(
                AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "mock://movement-serde-test");
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
        assertEquals("evt-movement-1", string(received, "eventId"));
        assertEquals(EVENT_TYPE, string(received, "eventType"));
        assertEquals("1.0.0", string(received, "schemaVersion"));
        assertEquals("container-movement-service", string(received, "source"));
        assertEquals(occurredAt.toString(), string(received, "occurredAt"));
        assertEquals("corr-1", string(received, "correlationId"));
        assertEquals("journey-1:IN_TRANSIT:4", string(received, "idempotencyKey"));
        assertEquals("container-1", string(received, "containerId"));
        assertEquals("booking-1", string(received, "bookingId"));
        assertEquals("IN_TRANSIT", string(received, "movementStatus"));
        assertEquals(4L, received.get("sequenceNumber"));
        assertEquals("Validated movement GATE_OUT", string(received, "statusReason"));
        assertEquals("location-1", string(received, "lastKnownLocationId"));
    }

    private String string(GenericRecord record, String field) {
        return record.get(field).toString();
    }
}
