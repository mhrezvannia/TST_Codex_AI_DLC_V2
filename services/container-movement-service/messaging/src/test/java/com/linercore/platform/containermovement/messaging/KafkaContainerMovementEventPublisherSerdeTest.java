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
    private static final String TOPIC = "containermovement.status";

    @Test
    void productionRecordRoundTripsEveryContractField() {
        Instant now = Instant.parse("2026-07-13T00:00:00Z");
        Map<String, String> payload = Map.ofEntries(
                Map.entry("id", "evt-movement-1"),
                Map.entry("type", EVENT_TYPE),
                Map.entry("source", "container-movement-service"),
                Map.entry("time", now.toString()),
                Map.entry("correlationId", "corr-1"),
                Map.entry("dataSchemaVersion", "1"),
                Map.entry("data.bookingRef", "booking-1"),
                Map.entry("data.containerRef", "MSCU6639870"),
                Map.entry("data.movementId", "movement-1"),
                Map.entry("data.moveCode", "LOAD"),
                Map.entry("data.eventClassifierCode", "ACT"),
                Map.entry("data.occurredDateTime", now.toString()),
                Map.entry("data.receivedDateTime", now.toString()),
                Map.entry("data.derivedStatus", "IN_TRANSIT"),
                Map.entry("data.emptyIndicatorCode", "LADEN"),
                Map.entry("data.transshipment", "false"),
                Map.entry("data.location.present", "true"),
                Map.entry("data.location.unLocationCode", "USNYC"),
                Map.entry("data.location.facilityCode", "PIER1"),
                Map.entry("data.location.facilityTypeCode", "POTE"));
        MovementStatusEvent event = new MovementStatusEvent(
                "evt-movement-1", EVENT_TYPE, "1", "journey-1", "booking-1",
                "MSCU6639870", MovementStatus.IN_TRANSIT, EVENT_TYPE + "-value",
                "container-movement-service", "evt-movement-1", "corr-1", now,
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

        GenericRecord data = (GenericRecord) received.get("data");
        GenericRecord location = (GenericRecord) data.get("location");
        assertEquals(0, wire[0]);
        assertEquals("evt-movement-1", string(received, "id"));
        assertEquals(EVENT_TYPE, string(received, "type"));
        assertEquals("container-movement-service", string(received, "source"));
        assertEquals(now.toString(), string(received, "time"));
        assertEquals("corr-1", string(received, "correlationId"));
        assertEquals(1, received.get("dataSchemaVersion"));
        assertEquals("booking-1", string(data, "bookingRef"));
        assertEquals("MSCU6639870", string(data, "containerRef"));
        assertEquals("movement-1", string(data, "movementId"));
        assertEquals("LOAD", string(data, "moveCode"));
        assertEquals("ACT", string(data, "eventClassifierCode"));
        assertEquals("IN_TRANSIT", string(data, "derivedStatus"));
        assertEquals("LADEN", string(data, "emptyIndicatorCode"));
        assertEquals(false, data.get("transshipment"));
        assertEquals("USNYC", string(location, "unLocationCode"));
        assertEquals("PIER1", string(location, "facilityCode"));
        assertEquals("POTE", string(location, "facilityTypeCode"));
    }

    private String string(GenericRecord record, String field) {
        return record.get(field).toString();
    }
}
