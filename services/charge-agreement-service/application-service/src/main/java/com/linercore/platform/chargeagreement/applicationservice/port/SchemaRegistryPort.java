package com.linercore.platform.chargeagreement.applicationservice.port;

public interface SchemaRegistryPort {
    SchemaSubject ensureRegistered(String eventType, String schemaVersion);
}
