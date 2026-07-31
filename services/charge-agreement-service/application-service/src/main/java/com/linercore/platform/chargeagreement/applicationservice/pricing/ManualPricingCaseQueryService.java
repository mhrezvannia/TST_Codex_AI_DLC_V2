package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import java.util.Objects;

public final class ManualPricingCaseQueryService {
    private static final String RESOURCE = "charge-manual-cases";
    private static final String ACTION = "read";

    private final AuthorizationPort authorization;
    private final ManualPricingCaseRepository cases;
    private final PricingTelemetry telemetry;

    public ManualPricingCaseQueryService(
            AuthorizationPort authorization,
            ManualPricingCaseRepository cases) {
        this(authorization, cases, PricingTelemetry.NOOP);
    }

    public ManualPricingCaseQueryService(
            AuthorizationPort authorization,
            ManualPricingCaseRepository cases,
            PricingTelemetry telemetry) {
        this.authorization = Objects.requireNonNull(authorization, "authorization port is required");
        this.cases = Objects.requireNonNull(cases, "manual pricing case repository is required");
        this.telemetry = Objects.requireNonNull(telemetry, "pricing telemetry is required");
    }

    public ManualPricingCaseRepository.ManualCasePage list(
            String subjectId,
            String correlationId,
            ManualPricingCaseRepository.ManualCaseQuery query) {
        long started = System.nanoTime();
        authorize(subjectId, correlationId, PricingTelemetry.Operation.MANUAL_LIST, started);
        try {
            ManualPricingCaseRepository.ManualCasePage result = cases.listOpen(query);
            record(PricingTelemetry.Operation.MANUAL_LIST, PricingTelemetry.Outcome.ALLOWED, started);
            return result;
        } catch (RuntimeException exception) {
            record(PricingTelemetry.Operation.MANUAL_LIST, PricingTelemetry.Outcome.UNAVAILABLE, started);
            throw exception;
        }
    }

    public ManualPricingCase detail(
            String subjectId,
            String correlationId,
            String caseId) {
        long started = System.nanoTime();
        authorize(subjectId, correlationId, PricingTelemetry.Operation.MANUAL_DETAIL, started);
        ManualPricingCase result = cases.findOpenById(caseId).orElse(null);
        if (result == null) {
            record(PricingTelemetry.Operation.MANUAL_DETAIL, PricingTelemetry.Outcome.NOT_FOUND, started);
            throw new ManualPricingCaseNotFoundException(caseId);
        }
        record(PricingTelemetry.Operation.MANUAL_DETAIL, PricingTelemetry.Outcome.ALLOWED, started);
        return result;
    }

    private void authorize(
            String subjectId,
            String correlationId,
            PricingTelemetry.Operation operation,
            long started) {
        if (!authorization.allowed(subjectId, RESOURCE, ACTION, correlationId)) {
            record(operation, PricingTelemetry.Outcome.DENIED, started);
            throw new SecurityException("manual pricing case access denied");
        }
    }

    private void record(
            PricingTelemetry.Operation operation,
            PricingTelemetry.Outcome outcome,
            long started) {
        telemetry.record(new PricingTelemetry.Signal(
                operation,
                outcome,
                PricingTelemetry.Basis.NONE,
                PricingTelemetry.ManualReason.NONE,
                Math.max(0, System.nanoTime() - started)));
    }

    public static final class ManualPricingCaseNotFoundException extends RuntimeException {
        public ManualPricingCaseNotFoundException(String caseId) {
            super("manual pricing case was not found");
        }
    }
}
