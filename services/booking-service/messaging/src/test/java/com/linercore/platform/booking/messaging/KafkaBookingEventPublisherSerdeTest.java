package com.linercore.platform.booking.messaging;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

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
                Map.entry("id", "8b472784-7636-5b18-8b9f-93414b33d72a"),
                Map.entry("source", "booking-service"),
                Map.entry("type", EVENT_TYPE),
                Map.entry("time", occurredAt.toString()),
                Map.entry("correlationId", "corr-1"),
                Map.entry("dataSchemaVersion", "1"),
                Map.entry("data.bookingId", "booking-1"),
                Map.entry("data.bookingRevision", "3"),
                Map.entry("data.routing.count", "1"),
                Map.entry("data.routing.0.legSequence", "1"),
                Map.entry("data.routing.0.loadUnLocode", "USNYC"),
                Map.entry("data.routing.0.dischargeUnLocode", "NLRTM"),
                Map.entry("data.routing.0.voyageId", "voyage-1"),
                Map.entry("data.equipment.count", "1"),
                Map.entry("data.equipment.0.equipmentTypeCode", "45G1"),
                Map.entry("data.equipment.0.quantity", "1"),
                Map.entry("data.equipment.0.equipmentId", "MSCU6639870"));
        BookingOutboxEvent event = new BookingOutboxEvent(
                "8b472784-7636-5b18-8b9f-93414b33d72a", EVENT_TYPE, "1.0.0", "booking-1", "BKG-1", 3,
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
        assertEquals("8b472784-7636-5b18-8b9f-93414b33d72a", string(received, "id"));
        assertEquals("booking-service", string(received, "source"));
        assertEquals(EVENT_TYPE, string(received, "type"));
        assertEquals(occurredAt.toString(), string(received, "time"));
        assertEquals("corr-1", string(received, "correlationId"));
        assertEquals(1, received.get("dataSchemaVersion"));
        GenericRecord data = (GenericRecord) received.get("data");
        assertEquals("booking-1", string(data, "bookingId"));
        assertEquals(3, data.get("bookingRevision"));
        GenericRecord leg = (GenericRecord) ((java.util.List<?>) data.get("routing")).get(0);
        assertEquals(1, leg.get("legSequence"));
        assertEquals("USNYC", string(leg, "loadUnLocode"));
        assertEquals("NLRTM", string(leg, "dischargeUnLocode"));
        assertEquals("voyage-1", string(leg, "voyageId"));
        GenericRecord equipment = (GenericRecord) ((java.util.List<?>) data.get("equipment")).get(0);
        assertEquals("45G1", string(equipment, "equipmentTypeCode"));
        assertEquals(1, equipment.get("quantity"));
        assertEquals("MSCU6639870", string(equipment, "equipmentId"));
        assertNull(received.getSchema().getField("customerId"));
        assertNull(received.getSchema().getField("pricingRef"));
    }

    private String string(GenericRecord record, String field) {
        return record.get(field).toString();
    }
}
