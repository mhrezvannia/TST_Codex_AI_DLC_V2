package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.SchemaRegistrar;
import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;

/** Reference-data adapter over the shared {@link SchemaRegistrar}. */
public class ConfluentSchemaRegistryAdapter implements SchemaRegistryPort {
    private static final String COMPATIBILITY = "BACKWARD";

    private final SchemaRegistrar registrar;
    private final AvroSchemaRepository schemas;

    public ConfluentSchemaRegistryAdapter(SchemaRegistrar registrar, AvroSchemaRepository schemas) {
        this.registrar = registrar;
        this.schemas = schemas;
    }

    @Override
    public SchemaSubject ensureRegistered(String eventType, String schemaVersion) {
        try {
            String subject = registrar.ensureRegistered(eventType, schemas.schemaFor(eventType), COMPATIBILITY);
            return new SchemaSubject(subject, eventType, schemaVersion, COMPATIBILITY);
        } catch (com.linercore.platform.messaging.EventPublicationException ex) {
            throw new EventPublicationException(ex.code(), ex.getMessage(), ex.retryable());
        }
    }
}
