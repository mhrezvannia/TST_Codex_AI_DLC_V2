package com.linercore.platform.messaging;

import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import org.apache.avro.Schema;

/** Confluent Schema Registry implementation of {@link SchemaRegistrar}. */
public class ConfluentSchemaRegistrar implements SchemaRegistrar {
    private final SchemaRegistryClient client;

    public ConfluentSchemaRegistrar(SchemaRegistryClient client) {
        this.client = client;
    }

    @Override
    @SuppressWarnings("deprecation") // register(String, org.apache.avro.Schema) avoids an extra AvroSchema wrapper dep
    public String ensureRegistered(String eventType, Schema schema, String compatibility) {
        String subject = eventType + "-value";
        try {
            client.updateCompatibility(subject, compatibility);
            client.register(subject, schema);
            return subject;
        } catch (IOException ex) {
            throw new EventPublicationException("SCHEMA_REGISTRY_UNAVAILABLE", ex.getMessage(), true);
        } catch (RestClientException ex) {
            throw new EventPublicationException("SCHEMA_REGISTRY_REJECTED", ex.getMessage(), ex.getStatus() != 409);
        }
    }
}
