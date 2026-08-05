package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.applicationservice.PricingConflictException;
import com.linercore.platform.chargeagreement.applicationservice.PricingRequestInProgressException;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.OwnedPricingCompletion;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingClaim;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingTerminalReceipt;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredPricingReceipt;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.pricing.PricingCalculator;
import com.linercore.platform.chargeagreement.domain.pricing.PricingResolution;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

public final class PricingApplicationService {
    private static final Duration LEASE = Duration.ofSeconds(10);

    private final AuthorizationPort authorization;
    private final PricingRequestRepository receipts;
    private final PricingAuthorityResolver resolver;
    private final PricingCalculator calculator;
    private final PricingRequestCanonicalizer canonicalizer;
    private final PricingTerminalRenderer renderer;
    private final IdGenerator ids;
    private final Clock clock;
    private final PricingTelemetry telemetry;

    public PricingApplicationService(
            AuthorizationPort authorization,
            PricingRequestRepository receipts,
            PricingAuthorityResolver resolver,
            PricingCalculator calculator,
            PricingRequestCanonicalizer canonicalizer,
            PricingTerminalRenderer renderer,
            IdGenerator ids,
            Clock clock) {
        this(authorization, receipts, resolver, calculator, canonicalizer, renderer, ids, clock,
                PricingTelemetry.NOOP);
    }

    public PricingApplicationService(
            AuthorizationPort authorization,
            PricingRequestRepository receipts,
            PricingAuthorityResolver resolver,
            PricingCalculator calculator,
            PricingRequestCanonicalizer canonicalizer,
            PricingTerminalRenderer renderer,
            IdGenerator ids,
            Clock clock,
            PricingTelemetry telemetry) {
        this.authorization = Objects.requireNonNull(authorization);
        this.receipts = Objects.requireNonNull(receipts);
        this.resolver = Objects.requireNonNull(resolver);
        this.calculator = Objects.requireNonNull(calculator);
        this.canonicalizer = Objects.requireNonNull(canonicalizer);
        this.renderer = Objects.requireNonNull(renderer);
        this.ids = Objects.requireNonNull(ids);
        this.clock = Objects.requireNonNull(clock);
        this.telemetry = Objects.requireNonNull(telemetry);
    }

    public PricingProviderResponse requestPricing(
            PricingRequest request,
            String idempotencyKey,
            String serviceSubject) {
        long started = System.nanoTime();
        if (!authorization.allowed(serviceSubject, "charge-agreement", "price", request.correlationId())) {
            record(PricingTelemetry.Outcome.DENIED, PricingTelemetry.Basis.NONE,
                    PricingTelemetry.ManualReason.NONE, started);
            throw new SecurityException("pricing access denied");
        }
        if (!request.pricingRequestId().equals(idempotencyKey)) {
            record(PricingTelemetry.Outcome.VALIDATION, PricingTelemetry.Basis.NONE,
                    PricingTelemetry.ManualReason.NONE, started);
            throw new IllegalArgumentException("Idempotency-Key must equal bookingRef:amendmentSeq");
        }
        String requestHash = canonicalizer.hash(request);
        StoredPricingReceipt existing = receipts.findReceiptByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) {
            return classifyExisting(existing, request, requestHash, started);
        }
        String ownerToken = ids.nextId();
        if (!receipts.insertClaim(new PricingClaim(
                idempotencyKey, request.bookingRef(), request.quantities().amendmentSeq(),
                requestHash, ownerToken, request.correlationId()), LEASE)) {
            StoredPricingReceipt winner = receipts.findReceiptByIdempotencyKey(idempotencyKey)
                    .orElseThrow(() -> new PricingRequestInProgressException(Duration.ofSeconds(1)));
            return classifyExisting(winner, request, requestHash, started);
        }
        return resolveAndComplete(request, idempotencyKey, requestHash, ownerToken, started);
    }

    private PricingProviderResponse classifyExisting(
            StoredPricingReceipt existing,
            PricingRequest request,
            String requestHash,
            long started) {
        if (!existing.requestHash().equals(requestHash)) {
            record(PricingTelemetry.Outcome.CONFLICT, PricingTelemetry.Basis.NONE,
                    PricingTelemetry.ManualReason.NONE, started);
            throw new PricingConflictException(
                    "IDEMPOTENCY_CONFLICT", "idempotency key was used for another pricing request");
        }
        if (existing.terminal() != null) {
            record(PricingTelemetry.Outcome.REPLAY, PricingTelemetry.Basis.UNKNOWN,
                    reason(existing.terminal().terminalCode()), started);
            return response(existing.terminal(), true);
        }
        String newOwner = ids.nextId();
        if (!receipts.takeOverExpiredClaim(existing.idempotencyKey(), newOwner, LEASE)) {
            record(PricingTelemetry.Outcome.IN_PROGRESS, PricingTelemetry.Basis.NONE,
                    PricingTelemetry.ManualReason.NONE, started);
            throw new PricingRequestInProgressException(Duration.ofSeconds(1));
        }
        record(PricingTelemetry.Outcome.TAKEOVER, PricingTelemetry.Basis.NONE,
                PricingTelemetry.ManualReason.NONE, started);
        return resolveAndComplete(request, existing.idempotencyKey(), requestHash, newOwner, started);
    }

    private PricingProviderResponse resolveAndComplete(
            PricingRequest request,
            String idempotencyKey,
            String requestHash,
            String ownerToken,
            long started) {
        PricingResolution resolution = resolver.resolve(request);
        Instant terminalAt = clock.instant();
        OwnedPricingCompletion completion;
        PricingTelemetry.Basis basis = PricingTelemetry.Basis.NONE;
        PricingTelemetry.ManualReason manualReason = PricingTelemetry.ManualReason.NONE;
        String proposedCaseId = null;
        if (resolution instanceof PricingResolution.Priced priced) {
            basis = priced.authority().basis() == com.linercore.platform.chargeagreement.domain.pricing
                    .ResolvedPricingAuthority.Basis.AGREEMENT
                    ? PricingTelemetry.Basis.AGREEMENT : PricingTelemetry.Basis.TARIFF;
            var result = calculator.calculate(priced.authority(), request, request.correlationId(), terminalAt);
            completion = new OwnedPricingCompletion(idempotencyKey, ownerToken, null, ignored ->
                    new PricingTerminalReceipt(
                            200, PricingTerminalReceipt.SCHEMA_VERSION, request.pricingRequestId(), "PRICED",
                            renderer.renderSuccess(result), request.correlationId(), terminalAt, null));
        } else if (resolution instanceof PricingResolution.Manual manual) {
            ManualPricingCase proposed = ManualPricingCase.open(
                    ids.nextId(), request, manual.reason().name(), requestHash, terminalAt);
            proposedCaseId = proposed.caseId();
            manualReason = reason(manual.reason().name());
            completion = new OwnedPricingCompletion(idempotencyKey, ownerToken, proposed, caseId ->
                    new PricingTerminalReceipt(
                            manual.reason().httpStatus(), PricingTerminalReceipt.SCHEMA_VERSION,
                            request.pricingRequestId(), manual.reason().name(),
                            renderer.renderManual(request, manual.reason(), caseId, terminalAt),
                            request.correlationId(), terminalAt, caseId));
        } else {
            record(PricingTelemetry.Outcome.UNAVAILABLE, PricingTelemetry.Basis.NONE,
                    PricingTelemetry.ManualReason.NONE, started);
            throw new PricingUnavailableException("pricing authority is unavailable");
        }
        PricingRequestRepository.CompletionResult completed = receipts.completeOwned(completion);
        if (completed.completed()) {
            if (proposedCaseId != null && !proposedCaseId.equals(completed.receipt().manualCaseId())) {
                record(PricingTelemetry.Outcome.CASE_REUSE, PricingTelemetry.Basis.NONE,
                        manualReason, started);
            }
            record(proposedCaseId == null ? PricingTelemetry.Outcome.PRICED : PricingTelemetry.Outcome.MANUAL,
                    basis, manualReason, started);
            return response(completed.receipt(), false);
        }
        record(PricingTelemetry.Outcome.STALE_OWNER, PricingTelemetry.Basis.NONE,
                manualReason, started);
        StoredPricingReceipt winner = receipts.findReceiptByIdempotencyKey(idempotencyKey).orElse(null);
        if (winner != null && winner.terminal() != null && winner.requestHash().equals(requestHash)) {
            record(PricingTelemetry.Outcome.REPLAY, PricingTelemetry.Basis.UNKNOWN,
                    reason(winner.terminal().terminalCode()), started);
            return response(winner.terminal(), true);
        }
        record(PricingTelemetry.Outcome.IN_PROGRESS, PricingTelemetry.Basis.NONE,
                PricingTelemetry.ManualReason.NONE, started);
        throw new PricingRequestInProgressException(Duration.ofSeconds(1));
    }

    private static PricingProviderResponse response(PricingTerminalReceipt receipt, boolean replayed) {
        return new PricingProviderResponse(
                receipt.httpStatus(), receipt.contentType(), receipt.responseSnapshot(), replayed);
    }

    private void record(
            PricingTelemetry.Outcome outcome,
            PricingTelemetry.Basis basis,
            PricingTelemetry.ManualReason manualReason,
            long started) {
        telemetry.record(new PricingTelemetry.Signal(
                PricingTelemetry.Operation.PRICING_REQUEST,
                outcome,
                basis,
                manualReason,
                Math.max(0, System.nanoTime() - started)));
    }

    private static PricingTelemetry.ManualReason reason(String value) {
        try {
            return PricingTelemetry.ManualReason.valueOf(value);
        } catch (IllegalArgumentException exception) {
            return PricingTelemetry.ManualReason.NONE;
        }
    }

    public static final class PricingUnavailableException extends RuntimeException {
        public PricingUnavailableException(String message) {
            super(message);
        }
    }
}
