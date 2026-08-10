package com.linercore.platform.chargeagreement.container.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;

/**
 * Agreement authorization uses the same bounded, fail-closed identity transport
 * as Rate authority while retaining an Agreement-specific application port.
 */
public final class HttpAgreementAuthorizationAdapter implements AgreementAuthorizationPort {
    private final HttpRateAuthorizationAdapter delegate;

    public HttpAgreementAuthorizationAdapter(
            String baseUrl,
            String serviceId,
            String serviceToken,
            ObjectMapper mapper) {
        this.delegate = new HttpRateAuthorizationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Override
    public Decision authorize(String subjectId, String resource, String action, String correlationId) {
        RateAuthorizationPort.Decision decision =
                delegate.authorize(subjectId, resource, action, correlationId);
        return switch (decision) {
            case ALLOW -> Decision.ALLOW;
            case DENY -> Decision.DENY;
            case UNAVAILABLE -> Decision.UNAVAILABLE;
        };
    }
}
