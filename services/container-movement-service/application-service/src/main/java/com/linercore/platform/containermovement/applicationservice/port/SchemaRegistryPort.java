package com.linercore.platform.containermovement.applicationservice.port;

public interface SchemaRegistryPort {
    SchemaSubject ensureRegistered(String eventType, String schemaVersion);
}
