package com.linercore.platform.messaging;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroDeserializerConfig;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.StandardEnvironment;

class PlatformMessagingTest {

    @Test
    void loadsSchemaRegistersAndRoundTripsAvroThroughRegistry() {
        AvroSchemaRepository schemas = new AvroSchemaRepository("avro", Path.of("contracts", "avro"));
        Schema schema = schemas.schemaFor("test.event");
        assertNotNull(schema, "schema should load from classpath avro/test.event.avsc");

        SchemaRegistryClient registry = new MockSchemaRegistryClient();
        SchemaRegistrar registrar = new ConfluentSchemaRegistrar(registry);
        assertEquals("test.event-value", registrar.ensureRegistered("test.event", schema, "BACKWARD"));

        GenericRecord record = new GenericData.Record(schema);
        record.put("id", "e1");
        record.put("payload", Map.of("code", "USD"));

        Map<String, Object> config = Map.of(AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "mock://plat-test");
        byte[] wire;
        GenericRecord back;
        try (KafkaAvroSerializer serializer = new KafkaAvroSerializer(registry);
                KafkaAvroDeserializer deserializer = new KafkaAvroDeserializer(registry)) {
            serializer.configure(config, false);
            Map<String, Object> deConfig = new HashMap<>(config);
            deConfig.put(KafkaAvroDeserializerConfig.SPECIFIC_AVRO_READER_CONFIG, false);
            deserializer.configure(deConfig, false);
            wire = serializer.serialize("t", record);
            back = (GenericRecord) deserializer.deserialize("t", wire);
        }

        assertEquals(0, wire[0], "Confluent wire-format magic byte (schema id was registered + used)");
        assertEquals("e1", back.get("id").toString());
        assertEquals("USD", ((Map<?, ?>) back.get("payload")).get(new org.apache.avro.util.Utf8("code")).toString());
    }

    @Test
    void guardRejectsNoopAdaptersOutsideLocalProfile() {
        StandardEnvironment nonLocal = new StandardEnvironment();
        nonLocal.setActiveProfiles("kafka");
        assertThrows(IllegalStateException.class, () -> NoopMessagingGuard.assertNoopAllowed(nonLocal, true));

        StandardEnvironment local = new StandardEnvironment();
        local.setActiveProfiles("local", "kafka");
        assertDoesNotThrow(() -> NoopMessagingGuard.assertNoopAllowed(local, true));

        // A real (non-noop) adapter is always allowed.
        assertDoesNotThrow(() -> NoopMessagingGuard.assertNoopAllowed(nonLocal, false));
    }
}
