package com.linercore.platform.booking.applicationservice.port;

public interface SchemaRegistryPort {
    SchemaSubject ensureRegistered(String eventType, String schemaVersion);
}
