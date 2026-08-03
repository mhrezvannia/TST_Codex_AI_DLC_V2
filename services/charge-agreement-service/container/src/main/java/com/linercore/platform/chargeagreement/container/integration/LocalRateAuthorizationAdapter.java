package com.linercore.platform.chargeagreement.container.integration;

import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import java.util.Map;
import java.util.Set;

public final class LocalRateAuthorizationAdapter implements RateAuthorizationPort {
    private static final Set<String> ANALYST_ACTIONS =
            Set.of("read", "create", "update", "approve", "create-successor");
    private static final Map<String, Set<String>> POLICY = Map.of(
            "local.superuser", ANALYST_ACTIONS,
            "local.pricing.analyst", ANALYST_ACTIONS,
            "local.charge.reader", Set.of("read"));

    @Override
    public Decision authorize(String subjectId, String resource, String action, String correlationId) {
        if (!"charge-rates".equals(resource) || correlationId == null || correlationId.isBlank()) {
            return Decision.DENY;
        }
        return POLICY.getOrDefault(subjectId, Set.of()).contains(action) ? Decision.ALLOW : Decision.DENY;
    }
}
