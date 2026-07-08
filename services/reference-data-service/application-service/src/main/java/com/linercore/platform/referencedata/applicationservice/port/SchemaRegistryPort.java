package com.linercore.platform.referencedata.applicationservice.port;

import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;

public interface SchemaRegistryPort {
    SchemaSubject ensureRegistered(String eventType, String schemaVersion);
}
