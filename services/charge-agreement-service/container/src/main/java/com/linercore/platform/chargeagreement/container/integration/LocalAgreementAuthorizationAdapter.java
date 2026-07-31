package com.linercore.platform.chargeagreement.container.integration;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import java.util.Map;
import java.util.Set;

/**
 * Explicit local proof identities. Unknown subjects and actions are denied.
 */
public final class LocalAgreementAuthorizationAdapter implements AgreementAuthorizationPort {
    private static final Set<String> ADMIN_ACTIONS = Set.of(
            "read", "create", "update", "approve", "create-successor", "suspend", "expire");
    private static final Map<String, Set<String>> GRANTS = Map.of(
            "local.pricing.analyst", ADMIN_ACTIONS,
            "local.charge.reader", Set.of("read"),
            "booking-service", Set.of("price"));

    @Override
    public Decision authorize(String subjectId, String resource, String action, String correlationId) {
        if ("charge-manual-cases".equals(resource)) {
            return ("local.pricing.analyst".equals(subjectId) || "local.charge.reader".equals(subjectId))
                    && "read".equals(action) ? Decision.ALLOW : Decision.DENY;
        }
        return "charge-agreements".equals(resource)
                && GRANTS.getOrDefault(subjectId, Set.of()).contains(action)
                ? Decision.ALLOW
                : Decision.DENY;
    }
}
