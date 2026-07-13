package com.linercore.platform.messaging;

import org.apache.avro.Schema;

/** Registers an event's Avro schema under the {@code <eventType>-value} subject. */
public interface SchemaRegistrar {
    String ensureRegistered(String eventType, Schema schema, String compatibility);
}
