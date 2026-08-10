package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.PricingHistoryPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.PricingFailureEvidence;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

public final class BookingPricingOrchestrator {
    private final BookingPricingCaptureService captureService;
    private final BookingPricingCompletionService completionService;
    private final PricingPort pricing;
    private final PricingOperationReceiptPort receipts;
    private final PricingHistoryPort history;
    private final Clock clock;
    private final BookingPricingTelemetry telemetry;

    public BookingPricingOrchestrator(
            BookingPricingCaptureService captureService,
            BookingPricingCompletionService completionService,
            PricingPort pricing,
            PricingOperationReceiptPort receipts,
            PricingHistoryPort history,
            Clock clock) {
        this(captureService, completionService, pricing, receipts, history, clock,
                BookingPricingTelemetry.noop());
    }

    public BookingPricingOrchestrator(
            BookingPricingCaptureService captureService,
            BookingPricingCompletionService completionService,
            PricingPort pricing,
            PricingOperationReceiptPort receipts,
            PricingHistoryPort history,
            Clock clock,
            BookingPricingTelemetry telemetry) {
        this.captureService = captureService;
        this.completionService = completionService;
        this.pricing = pricing;
        this.receipts = receipts;
        this.history = history;
        this.clock = clock;
        this.telemetry = telemetry;
    }

    public PricingCommandResult price(
            BookingId bookingId, String actorSubjectId, String correlationId) {
        Instant started = Instant.now(clock);
        CapturedOperation captured =
                captureService.capture(bookingId, actorSubjectId, correlationId);
        if (captured.replay() != null) {
            return observed(captured.replay(), captured.receipt(), started);
        }

        // This provider call is deliberately between the short claim and completion transactions.
        PricingPortResult providerResult = pricing.requestPricing(captured.attempt());
        PricingCommandResult projected = project(captured, providerResult);
        var completion = completionService.complete(new CompletionCommand(
                captured.receiptKey(),
                captured.attempt().booking().id(),
                captured.ownerToken(),
                captured.fenceToken(),
                captured.actorSubjectId(),
                captured.attempt().booking().revision(),
                captured.attempt().input().amendmentSeq(),
                captured.attempt().inputHash(),
                projected));
        if (completion.disposition() == CompletionDisposition.COMPLETED
                || completion.disposition() == CompletionDisposition.REPLAY) {
            return observed(completion.response(),
                    completion.disposition() == CompletionDisposition.REPLAY
                            ? BookingPricingTelemetry.Receipt.REPLAY
                            : captured.receipt(),
                    started);
        }
        if (completion.disposition() == CompletionDisposition.BOOKING_CHANGED) {
            return observed(
                    diagnostic(captured, BookingPricingOutcome.BOOKING_CHANGED, "BOOKING_CHANGED", 0),
                    BookingPricingTelemetry.Receipt.BOOKING_CHANGED,
                    started);
        }
        PricingCommandResult result = receipts.find(captured.receiptKey())
                .map(PricingOperationReceiptPort.Receipt::response)
                .filter(java.util.Objects::nonNull)
                .orElseGet(() -> diagnostic(captured, BookingPricingOutcome.CONFLICT, "STALE_OWNER", 0));
        return observed(result, BookingPricingTelemetry.Receipt.STALE_OWNER, started);
    }

    public PricingHistoryPage history(BookingId bookingId, String cursor, int limit) {
        int bounded = Math.max(1, Math.min(PricingHistoryPage.MAX_PAGE_SIZE, limit));
        return history.findHistory(bookingId, cursor, bounded);
    }

    private PricingCommandResult project(CapturedOperation captured, PricingPortResult providerResult) {
        PricingInput input = captured.attempt().input();
        if (providerResult instanceof PricingPortResult.Priced priced) {
            var snapshot = priced.snapshot();
            if (!snapshot.bookingRef().equals(input.bookingRef())
                    || snapshot.amendmentSeq() != input.amendmentSeq()
                    || snapshot.bookingRevision() != captured.attempt().booking().revision()
                    || !snapshot.inputFingerprint().equals(input.fingerprint())
                    || !snapshot.requestedDepartureDate().equals(input.requestedDepartureDate())) {
                return diagnostic(captured, BookingPricingOutcome.MALFORMED, "MALFORMED_PROVIDER_RESPONSE", 0);
            }
            return new PricingCommandResult(
                    BookingPricingOutcome.PRICED,
                    snapshot.pricingRequestId(),
                    input.amendmentSeq(),
                    input.fingerprint(),
                    snapshot,
                    null,
                    null,
                    0,
                    snapshot.correlationId());
        }
        if (providerResult instanceof PricingPortResult.LegacyPriced legacy) {
            return new PricingCommandResult(
                    BookingPricingOutcome.LEGACY_PRICED,
                    legacy.snapshot().pricingRequestId(),
                    input.amendmentSeq(),
                    input.fingerprint(),
                    null,
                    legacy.snapshot(),
                    null,
                    0,
                    legacy.correlationId());
        }
        if (providerResult instanceof PricingPortResult.ManualRequired manual) {
            return failure(
                    captured,
                    BookingPricingOutcome.MANUAL_PRICING_REQUIRED,
                    manual.reasonCode(),
                    manual.pricingRequestId(),
                    manual.manualCaseId(),
                    1,
                    null,
                    null,
                    manual.correlationId(),
                    0);
        }
        if (providerResult instanceof PricingPortResult.Outage outage) {
            BookingPricingOutcome outcome = switch (outage.reasonCode()) {
                case "TIMEOUT" -> BookingPricingOutcome.TIMEOUT;
                case "CIRCUIT_OPEN" -> BookingPricingOutcome.CIRCUIT_OPEN;
                default -> BookingPricingOutcome.UNAVAILABLE;
            };
            return failure(captured, outcome, outage.reasonCode(), null, null, outage.attempts(),
                    outage.circuitState(), outage.nextProbeAt(), outage.correlationId(), 0);
        }
        if (providerResult instanceof PricingPortResult.InProgress pending) {
            return diagnostic(captured, BookingPricingOutcome.IN_PROGRESS, pending.reasonCode(),
                    pending.retryAfterSeconds());
        }
        if (providerResult instanceof PricingPortResult.Denied denied) {
            return diagnostic(captured, BookingPricingOutcome.DENIED, denied.reasonCode(), 0);
        }
        if (providerResult instanceof PricingPortResult.Validation validation) {
            return diagnostic(captured, BookingPricingOutcome.VALIDATION_FAILED, validation.reasonCode(), 0);
        }
        if (providerResult instanceof PricingPortResult.Malformed malformed) {
            return diagnostic(captured, BookingPricingOutcome.MALFORMED, malformed.reasonCode(), 0);
        }
        PricingPortResult.Conflict conflict = (PricingPortResult.Conflict) providerResult;
        return diagnostic(captured, BookingPricingOutcome.CONFLICT, conflict.reasonCode(), 0);
    }

    private PricingCommandResult diagnostic(
            CapturedOperation captured,
            BookingPricingOutcome outcome,
            String reasonCode,
            int retryAfterSeconds) {
        return failure(captured, outcome, reasonCode, null, null, 0, null, null,
                captured.attempt().correlationId(), retryAfterSeconds);
    }

    private PricingCommandResult failure(
            CapturedOperation captured,
            BookingPricingOutcome outcome,
            String reasonCode,
            String pricingRequestId,
            String manualCaseId,
            int attempts,
            String circuitState,
            Instant nextProbeAt,
            String correlationId,
            int retryAfterSeconds) {
        PricingFailureEvidence evidence = new PricingFailureEvidence(
                reasonCode,
                reasonCode,
                pricingRequestId,
                manualCaseId,
                attempts,
                circuitState,
                nextProbeAt,
                correlationId,
                Instant.now(clock),
                captured.attempt().input().amendmentSeq());
        return new PricingCommandResult(
                outcome,
                pricingRequestId,
                captured.attempt().input().amendmentSeq(),
                captured.attempt().inputHash(),
                null,
                null,
                evidence,
                retryAfterSeconds,
                correlationId);
    }

    private PricingCommandResult observed(
            PricingCommandResult result,
            BookingPricingTelemetry.Receipt receipt,
            Instant started) {
        BookingPricingTelemetry.Basis basis = result.typedSnapshot() == null
                ? BookingPricingTelemetry.Basis.NONE
                : BookingPricingTelemetry.Basis.valueOf(result.typedSnapshot().pricingBasis());
        int attempts = result.failureEvidence() == null ? 0 : result.failureEvidence().attempts();
        String circuitState =
                result.failureEvidence() == null ? null : result.failureEvidence().circuitState();
        BookingPricingTelemetry.Circuit circuit =
                result.outcome() == BookingPricingOutcome.CIRCUIT_OPEN || "OPEN".equalsIgnoreCase(circuitState)
                        ? BookingPricingTelemetry.Circuit.OPEN
                        : "CLOSED".equalsIgnoreCase(circuitState)
                                ? BookingPricingTelemetry.Circuit.CLOSED
                                : BookingPricingTelemetry.Circuit.UNKNOWN;
        Duration elapsed = Duration.between(started, Instant.now(clock));
        if (elapsed.isNegative()) {
            elapsed = Duration.ZERO;
        }
        telemetry.record(new BookingPricingTelemetry.Observation(
                result.amendmentSeq() == 0
                        ? BookingPricingTelemetry.Operation.FIRST_PRICE
                        : BookingPricingTelemetry.Operation.REPRICE,
                result.outcome(),
                basis,
                attempts > 1 ? BookingPricingTelemetry.Retry.RETRIED : BookingPricingTelemetry.Retry.NONE,
                circuit,
                receipt,
                elapsed));
        return result;
    }

    record CapturedOperation(
            String receiptKey,
            String ownerToken,
            long fenceToken,
            String actorSubjectId,
            PricingAttempt attempt,
            PricingCommandResult replay,
            BookingPricingTelemetry.Receipt receipt) {
        static CapturedOperation replay(
                PricingCommandResult result,
                BookingPricingTelemetry.Receipt receipt) {
            return new CapturedOperation(null, null, 0, null, null, result, receipt);
        }
    }
}
