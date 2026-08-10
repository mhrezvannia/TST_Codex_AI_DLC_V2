package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionResult;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.time.Clock;
import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fenced local publication boundary. Receipt terminal state, mutable Booking
 * current state, and immutable typed history commit or roll back together.
 */
public class BookingPricingCompletionService {
    private final BookingRepository bookings;
    private final PricingOperationReceiptPort receipts;
    private final PricingSnapshotRepository snapshots;
    private final Clock clock;

    public BookingPricingCompletionService(
            BookingRepository bookings,
            PricingOperationReceiptPort receipts,
            PricingSnapshotRepository snapshots,
            Clock clock) {
        this.bookings = bookings;
        this.receipts = receipts;
        this.snapshots = snapshots;
        this.clock = clock;
    }

    @Transactional
    public CompletionResult complete(CompletionCommand command) {
        Booking booking = bookings.findByIdForUpdate(command.bookingId()).orElseThrow();
        if (!matchesCapturedInput(booking, command)) {
            return new CompletionResult(CompletionDisposition.BOOKING_CHANGED, command.response());
        }
        CompletionResult completion = receipts.complete(command);
        if (completion.disposition() != CompletionDisposition.COMPLETED) {
            return completion;
        }
        publishCurrentState(booking, command);
        return completion;
    }

    private static boolean matchesCapturedInput(Booking booking, CompletionCommand command) {
        if (booking.revision() != command.expectedRevision()
                || booking.pricingAmendmentSeq() != command.expectedAmendmentSeq()
                || command.response().amendmentSeq() != command.expectedAmendmentSeq()
                || !command.response().inputFingerprint().equals(command.expectedInputHash())) {
            return false;
        }
        PricingInput current = PricingInput.from(booking, booking.pricingAmendmentSeq());
        return current.fingerprint().equals(command.expectedInputHash());
    }

    private void publishCurrentState(Booking booking, CompletionCommand command) {
        PricingCommandResult response = command.response();
        Instant completedAt = Instant.now(clock);
        if (response.outcome() == BookingPricingOutcome.PRICED) {
            Booking updated =
                    booking.typedPriced(response.typedSnapshot(), command.actorSubjectId(), completedAt);
            snapshots.append(booking.id(), PricingSnapshot.typed(response.typedSnapshot()));
            bookings.save(updated);
        } else if (response.outcome() == BookingPricingOutcome.LEGACY_PRICED) {
            // Kept for honest legacy display, but aggregate confirmation is fail-closed.
            bookings.save(booking.priced(
                    response.legacySnapshot(), command.actorSubjectId(), completedAt));
        }
    }
}
