package com.linercore.platform.booking.container;

import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import java.util.Map;
import java.util.Set;

final class BookingLocalAuthorization implements AuthorizationPort {
    private static final Map<String, Set<String>> ACTIONS = Map.of(
            "local-user", Set.of(
                    "create", "read", "validate", "request-pricing", "confirm", "amend", "reconfirm",
                    "request-dnd-pricing"),
            "local-seed", Set.of("create", "read"),
            "container-movement-service", Set.of("consume-movement-status"));

    @Override
    public boolean allowed(String subjectId, String resource, String action, String correlationId) {
        return "booking".equals(resource)
                && correlationId != null
                && !correlationId.isBlank()
                && ACTIONS.getOrDefault(subjectId, Set.of()).contains(action);
    }
}
