package com.linercore.platform.containermovement.messaging;

import com.linercore.platform.containermovement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.containermovement.applicationservice.port.SchemaSubject;
import com.linercore.platform.messaging.LocalNoopMarker;

public class LocalNoopSchemaRegistryAdapter implements SchemaRegistryPort, LocalNoopMarker {
    @Override
    public SchemaSubject ensureRegistered(String eventType, String schemaVersion) {
        return new SchemaSubject(eventType + "-value", eventType, schemaVersion, "LOCAL_NOOP");
    }
}
