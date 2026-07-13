package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import org.apache.avro.Schema;

public class ConfluentSchemaRegistryAdapter implements SchemaRegistryPort {
    private static final String COMPATIBILITY = "BACKWARD";

    private final SchemaRegistryClient client;
    private final AvroSchemaRepository schemas;

    public ConfluentSchemaRegistryAdapter(SchemaRegistryClient client, AvroSchemaRepository schemas) {
        this.client = client;
        this.schemas = schemas;
    }

    public SchemaSubject ensureRegistered(String eventType, String schemaVersion) {
        String subject = eventType + "-value";
        Schema schema = schemas.schemaFor(eventType);
        try {
            client.updateCompatibility(subject, COMPATIBILITY);
            client.register(subject, schema);
            return new SchemaSubject(subject, eventType, schemaVersion, COMPATIBILITY);
        } catch (IOException ex) {
            throw new EventPublicationException("SCHEMA_REGISTRY_UNAVAILABLE", ex.getMessage(), true);
        } catch (RestClientException ex) {
            throw new EventPublicationException("SCHEMA_REGISTRY_REJECTED", ex.getMessage(), ex.getStatus() != 409);
        }
    }
}
