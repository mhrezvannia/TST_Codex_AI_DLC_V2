package com.linercore.platform.containermovement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.linercore.platform.containermovement.domain.model.ExpectedMovement;

final class JdbcJson {
    private final ObjectMapper mapper;

    JdbcJson(ObjectMapper mapper) {
        SimpleModule snapshotCompatibility = new SimpleModule("container-movement-snapshot-compatibility");
        snapshotCompatibility.addDeserializer(ExpectedMovement.class, new ExpectedMovementDeserializer());
        this.mapper = mapper.copy()
                .registerModule(new JavaTimeModule())
                .registerModule(snapshotCompatibility)
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    String write(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("failed to serialize snapshot", ex);
        }
    }

    <T> T read(String value, Class<T> type) {
        try {
            return mapper.readValue(value, type);
        } catch (Exception ex) {
            throw new IllegalStateException("failed to deserialize snapshot", ex);
        }
    }
}
