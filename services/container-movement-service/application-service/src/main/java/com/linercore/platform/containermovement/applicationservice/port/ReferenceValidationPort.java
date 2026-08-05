package com.linercore.platform.containermovement.applicationservice.port;

import java.time.Instant;
import java.util.List;

public interface ReferenceValidationPort {
    List<String> inactiveLocationIds(List<String> locationIds, String correlationId);

    default Availability availability(String correlationId) {
        return new Availability(State.FRESH, null, null);
    }

    enum State {
        FRESH,
        LAST_KNOWN,
        UNAVAILABLE
    }

    record Availability(State state, String reason, Instant checkedAt) {
        public Availability {
            if (state == null) {
                throw new IllegalArgumentException("reference availability state is required");
            }
        }
    }
}
