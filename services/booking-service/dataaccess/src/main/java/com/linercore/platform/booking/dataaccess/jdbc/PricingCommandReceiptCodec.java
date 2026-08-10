package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;

final class PricingCommandReceiptCodec {
    private final ObjectMapper mapper;

    PricingCommandReceiptCodec(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    String write(PricingCommandResult result) {
        try {
            return mapper.writeValueAsString(result);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("cannot serialize pricing receipt", exception);
        }
    }

    PricingCommandResult read(String payload) {
        if (payload == null) {
            return null;
        }
        try {
            return mapper.readValue(payload, PricingCommandResult.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("cannot deserialize pricing receipt", exception);
        }
    }
}
