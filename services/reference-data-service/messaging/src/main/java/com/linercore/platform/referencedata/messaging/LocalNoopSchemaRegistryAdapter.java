package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;

public class LocalNoopSchemaRegistryAdapter implements SchemaRegistryPort, LocalNoopMessagingAdapter {
    public SchemaSubject ensureRegistered(String eventType, String schemaVersion) {
        return new SchemaSubject(eventType + "-value", eventType, schemaVersion, "LOCAL_NOOP");
    }
}
