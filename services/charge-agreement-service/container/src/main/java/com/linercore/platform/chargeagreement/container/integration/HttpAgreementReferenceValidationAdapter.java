package com.linercore.platform.chargeagreement.container.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import java.util.List;

/**
 * Adapts the established Reference Data transport to Agreement field-aware
 * validation without widening the provider response contract.
 */
public final class HttpAgreementReferenceValidationAdapter implements AgreementReferenceValidationPort {
    private final HttpRateReferenceValidationAdapter delegate;

    public HttpAgreementReferenceValidationAdapter(
            String baseUrl,
            String serviceId,
            String serviceToken,
            ObjectMapper mapper) {
        this.delegate = new HttpRateReferenceValidationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Override
    public List<Violation> validate(Request request) {
        RateReferenceValidationPort.Request adapted = new RateReferenceValidationPort.Request(
                request.correlationId(),
                request.checks().stream()
                        .map(check -> new RateReferenceValidationPort.Check(
                                check.fieldPath(), check.referenceSet(), check.referenceId(), null))
                        .toList());
        return delegate.validate(adapted).stream()
                .map(value -> new Violation(value.fieldPath(), value.reason()))
                .toList();
    }
}
