package com.linercore.platform.messaging;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.avro.Schema;

/**
 * Loads and caches Avro schemas by event type from the classpath ({@code <base>/<eventType>.avsc})
 * with a filesystem fallback. Shared by every service's publisher.
 */
public class AvroSchemaRepository {
    private final String classpathBase;
    private final Path fileBase;
    private final Map<String, Schema> cache = new ConcurrentHashMap<>();

    public AvroSchemaRepository(String classpathBase, Path fileBase) {
        this.classpathBase = trimSlashes(classpathBase == null || classpathBase.isBlank() ? "avro" : classpathBase);
        this.fileBase = fileBase == null ? Path.of("contracts", "avro") : fileBase;
    }

    public Schema schemaFor(String eventType) {
        return cache.computeIfAbsent(eventType, this::loadSchema);
    }

    private Schema loadSchema(String eventType) {
        String resource = classpathBase + "/" + eventType + ".avsc";
        try (InputStream stream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource)) {
            if (stream != null) {
                return new Schema.Parser().parse(stream);
            }
        } catch (IOException ex) {
            throw new EventPublicationException("SCHEMA_LOAD_FAILED", ex.getMessage(), false);
        }

        Path schemaPath = fileBase.resolve(eventType + ".avsc");
        if (!Files.exists(schemaPath)) {
            throw new EventPublicationException("SCHEMA_NOT_FOUND", "missing Avro schema for " + eventType, false);
        }
        try (InputStream stream = Files.newInputStream(schemaPath)) {
            return new Schema.Parser().parse(stream);
        } catch (IOException ex) {
            throw new EventPublicationException("SCHEMA_LOAD_FAILED", ex.getMessage(), false);
        }
    }

    private String trimSlashes(String value) {
        String trimmed = value;
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1);
        }
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
