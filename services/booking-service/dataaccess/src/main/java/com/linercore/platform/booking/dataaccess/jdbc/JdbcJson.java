package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

final class JdbcJson {
    private final ObjectMapper mapper;

    JdbcJson(ObjectMapper mapper) {
        this.mapper = mapper.copy()
                .registerModule(new JavaTimeModule())
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
