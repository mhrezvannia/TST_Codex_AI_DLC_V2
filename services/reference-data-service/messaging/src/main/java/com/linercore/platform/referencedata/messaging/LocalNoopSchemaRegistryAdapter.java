package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;

/** Local-only no-op schema registry adapter; rejected outside the local profile. */
public class LocalNoopSchemaRegistryAdapter implements SchemaRegistryPort, LocalNoopMarker {
    @Override
    public SchemaSubject ensureRegistered(String eventType, String schemaVersion) {
        return new SchemaSubject(eventType + "-value", eventType, schemaVersion, "LOCAL_NOOP");
    }
}
