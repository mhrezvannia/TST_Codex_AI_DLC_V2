package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimDisposition;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.BookingStatus;
import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;
import org.springframework.transaction.annotation.Transactional;

/**
 * The short pricing capture boundary. The Booking row lock and receipt claim
 * are intentionally held by the same datasource transaction.
 */
public class BookingPricingCaptureService {
    private static final Duration CLAIM_LEASE = Duration.ofSeconds(15);
    private static final Set<BookingStatus> PRICEABLE = Set.of(
            BookingStatus.VALIDATED,
            BookingStatus.PRICING_PENDING,
            BookingStatus.MANUAL_PRICING,
            BookingStatus.AMENDED);

    private final BookingRepository bookings;
    private final AuthorizationPort authorization;
    private final PricingOperationReceiptPort receipts;
    private final Supplier<String> ownerTokens;

    public BookingPricingCaptureService(
            BookingRepository bookings,
            AuthorizationPort authorization,
            PricingOperationReceiptPort receipts,
            Supplier<String> ownerTokens) {
        this.bookings = bookings;
        this.authorization = authorization;
        this.receipts = receipts;
        this.ownerTokens = ownerTokens;
    }

    @Transactional
    public BookingPricingOrchestrator.CapturedOperation capture(
            BookingId bookingId, String actorSubjectId, String correlationId) {
        if (!authorization.allowed(actorSubjectId, "booking", "request-pricing", correlationId)) {
            throw new SecurityException("booking pricing is not authorized");
        }
        Booking booking = bookings.findByIdForUpdate(bookingId).orElseThrow();
        int amendmentSeq = booking.pricingAmendmentSeq();
        PricingInput input = PricingInput.from(booking, amendmentSeq);
        String receiptKey = "P|" + input.providerKey();
        String ownerToken = ownerTokens.get();
        if (receipts.find(receiptKey).isEmpty() && !PRICEABLE.contains(booking.status())) {
            throw new IllegalStateException("booking is not priceable");
        }
        var claim = receipts.claim(new ClaimCommand(
                receiptKey,
                booking.id(),
                input.providerKey(),
                input.fingerprint(),
                ownerToken,
                CLAIM_LEASE,
                booking.revision(),
                amendmentSeq,
                correlationId));
        if (claim.disposition() == ClaimDisposition.REPLAY) {
            return BookingPricingOrchestrator.CapturedOperation.replay(
                    claim.receipt().response(), BookingPricingTelemetry.Receipt.REPLAY);
        }
        if (claim.disposition() == ClaimDisposition.IN_PROGRESS) {
            return BookingPricingOrchestrator.CapturedOperation.replay(
                    diagnostic(BookingPricingOutcome.IN_PROGRESS, amendmentSeq, input, correlationId, 5),
                    BookingPricingTelemetry.Receipt.IN_PROGRESS);
        }
        if (claim.disposition() == ClaimDisposition.CONFLICT) {
            return BookingPricingOrchestrator.CapturedOperation.replay(
                    diagnostic(BookingPricingOutcome.CONFLICT, amendmentSeq, input, correlationId, 0),
                    BookingPricingTelemetry.Receipt.CONFLICT);
        }
        if (!PRICEABLE.contains(booking.status())) {
            throw new IllegalStateException("booking is not priceable");
        }
        PricingAttempt attempt = new PricingAttempt(
                booking,
                input,
                input.canonicalBytes(),
                input.fingerprint(),
                input.providerKey(),
                correlationId);
        return new BookingPricingOrchestrator.CapturedOperation(
                receiptKey,
                ownerToken,
                claim.receipt().fenceToken(),
                actorSubjectId,
                attempt,
                null,
                claim.receipt().fenceToken() > 1
                        ? BookingPricingTelemetry.Receipt.TAKEOVER
                        : BookingPricingTelemetry.Receipt.CLAIMED);
    }

    private static PricingCommandResult diagnostic(
            BookingPricingOutcome outcome,
            int amendmentSeq,
            PricingInput input,
            String correlationId,
            int retryAfterSeconds) {
        return new PricingCommandResult(
                outcome,
                null,
                amendmentSeq,
                input.fingerprint(),
                null,
                null,
                null,
                retryAfterSeconds,
                correlationId);
    }
}
