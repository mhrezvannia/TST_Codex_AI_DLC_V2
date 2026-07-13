package com.linercore.platform.booking.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.OutboxStatus;
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

class KafkaBookingEventPublisherSerdeTest {
    private static final String EVENT_TYPE = "booking.confirmed";
    private static final String TOPIC = "booking.events";

    @Test
    void productionRecordRoundTripsEveryContractField() {
        Instant occurredAt = Instant.parse("2026-07-13T00:00:00Z");
        Map<String, String> payload = Map.ofEntries(
                Map.entry("eventId", "evt-booking-1"),
                Map.entry("eventType", EVENT_TYPE),
                Map.entry("schemaVersion", "1.0.0"),
                Map.entry("source", "booking-service"),
                Map.entry("occurredAt", occurredAt.toString()),
                Map.entry("correlationId", "corr-1"),
                Map.entry("idempotencyKey", "booking-1:3:CONFIRMED"),
                Map.entry("bookingId", "booking-1"),
                Map.entry("bookingRevision", "3"),
                Map.entry("pricingRef", "quote-1"),
                Map.entry("customerId", "customer-1"),
                Map.entry("originLocationId", "loc-origin"),
                Map.entry("destinationLocationId", "loc-destination"),
                Map.entry("containerId", "container-1"),
                Map.entry("equipmentTypeId", "equipment-40hc"));
        BookingOutboxEvent event = new BookingOutboxEvent(
                "evt-booking-1", EVENT_TYPE, "1.0.0", "booking-1", "BKG-1", 3,
                EVENT_TYPE + "-value", "booking-service", "booking-1:3:CONFIRMED",
                "corr-1", occurredAt, payload, OutboxStatus.PENDING, 0,
                null, null, null, null, null);

        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));
        GenericRecord produced = KafkaBookingEventPublisher.toGenericRecord(schemas.schemaFor(EVENT_TYPE), event);

        MockSchemaRegistryClient registry = new MockSchemaRegistryClient();
        Map<String, Object> config = Map.of(
                AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "mock://booking-serde-test");
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
        assertEquals("evt-booking-1", string(received, "eventId"));
        assertEquals(EVENT_TYPE, string(received, "eventType"));
        assertEquals("1.0.0", string(received, "schemaVersion"));
        assertEquals("booking-service", string(received, "source"));
        assertEquals(occurredAt.toString(), string(received, "occurredAt"));
        assertEquals("corr-1", string(received, "correlationId"));
        assertEquals("booking-1:3:CONFIRMED", string(received, "idempotencyKey"));
        assertEquals("booking-1", string(received, "bookingId"));
        assertEquals(3, received.get("bookingRevision"));
        assertEquals("quote-1", string(received, "pricingRef"));
        assertEquals("customer-1", string(received, "customerId"));
        assertEquals("loc-origin", string(received, "originLocationId"));
        assertEquals("loc-destination", string(received, "destinationLocationId"));
        assertEquals("container-1", string(received, "containerId"));
        assertEquals("equipment-40hc", string(received, "equipmentTypeId"));
    }

    private String string(GenericRecord record, String field) {
        return record.get(field).toString();
    }
}
