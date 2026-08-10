package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.ClaimResult;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionCommand;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionDisposition;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.CompletionResult;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort.Receipt;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

class BookingPricingTransactionBoundaryTest {
    private static final Instant NOW = Instant.parse("2026-07-29T10:00:00Z");

    @Test
    void captureLocksBookingThenClaimsReceiptInsidePublicTransactionBoundary()
            throws NoSuchMethodException {
        List<String> events = new ArrayList<>();
        MutableBookings bookings = new MutableBookings(booking(), events);
        RecordingReceipts receipts = new RecordingReceipts(events);
        BookingPricingCaptureService capture = new BookingPricingCaptureService(
                bookings, (subject, resource, action, correlation) -> true, receipts, () -> "owner-1");

        var operation = capture.capture(bookings.value.id(), "booking-user", "corr-1");

        assertEquals(List.of("booking-lock", "receipt-find", "receipt-claim"), events);
        assertEquals("BKG-1:0", operation.attempt().providerKey());
        assertTrue(BookingPricingCaptureService.class
                .getMethod("capture", BookingId.class, String.class, String.class)
                .isAnnotationPresent(Transactional.class));
    }

    @Test
    void fencedCompletionPublishesMatchingAggregateCurrentAndTypedHistory()
            throws NoSuchMethodException {
        List<String> events = new ArrayList<>();
        Booking initial = booking();
        PricingInput input = PricingInput.from(initial, 0);
        BookingPricingSnapshot snapshot = snapshot(initial, input);
        PricingCommandResult response = new PricingCommandResult(
                BookingPricingOutcome.PRICED,
                snapshot.pricingRequestId(),
                0,
                input.fingerprint(),
                snapshot,
                null,
                null,
                0,
                "corr-1");
        MutableBookings bookings = new MutableBookings(initial, events);
        RecordingReceipts receipts = new RecordingReceipts(events);
        RecordingSnapshots snapshots = new RecordingSnapshots(events);
        BookingPricingCompletionService completion = new BookingPricingCompletionService(
                bookings,
                receipts,
                snapshots,
                Clock.fixed(NOW.plusSeconds(1), ZoneOffset.UTC));

        CompletionResult result = completion.complete(new CompletionCommand(
                "P|BKG-1:0",
                initial.id(),
                "owner-1",
                1,
                "booking-user",
                initial.revision(),
                0,
                input.fingerprint(),
                response));

        assertEquals(CompletionDisposition.COMPLETED, result.disposition());
        assertNotNull(bookings.value.pricingSnapshot().typed());
        assertEquals(snapshot.pricingRequestId(),
                bookings.value.pricingSnapshot().typed().pricingRequestId());
        assertEquals(snapshot.pricingRequestId(),
                snapshots.current.typed().pricingRequestId());
        assertTrue(bookings.value.confirmationPricingEligible());
        assertEquals(
                List.of("booking-lock", "receipt-complete", "history-append", "booking-save"),
                events);
        assertTrue(BookingPricingCompletionService.class
                .getMethod("complete", CompletionCommand.class)
                .isAnnotationPresent(Transactional.class));
    }

    @Test
    void legacyCompletionAndCommandResultRemainFailClosedForConfirmation() {
        Booking initial = booking();
        PricingInput input = PricingInput.from(initial, 0);
        PricingSnapshot legacy = new PricingSnapshot(
                "legacy-1",
                "legacy-quote",
                "QUOTED",
                java.util.Map.of("total", "99.00"),
                NOW,
                "corr-1");
        PricingCommandResult response = new PricingCommandResult(
                BookingPricingOutcome.LEGACY_PRICED,
                "legacy-1",
                0,
                input.fingerprint(),
                null,
                legacy,
                null,
                0,
                "corr-1");
        MutableBookings bookings = new MutableBookings(initial, new ArrayList<>());
        BookingPricingCompletionService completion = new BookingPricingCompletionService(
                bookings,
                new RecordingReceipts(new ArrayList<>()),
                new RecordingSnapshots(new ArrayList<>()),
                Clock.fixed(NOW.plusSeconds(1), ZoneOffset.UTC));

        completion.complete(new CompletionCommand(
                "P|BKG-1:0",
                initial.id(),
                "owner-1",
                1,
                "booking-user",
                initial.revision(),
                0,
                input.fingerprint(),
                response));

        assertFalse(response.confirmationEligible());
        assertFalse(bookings.value.confirmationPricingEligible());
    }

    private static Booking booking() {
        return PricingInputTest.booking("2026-08-01");
    }

    private static BookingPricingSnapshot snapshot(Booking booking, PricingInput input) {
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "200.00", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "40.00", "20.00"),
                line("THC", "LOCAL", "LOCAL", "20.00", "10.00"));
        return new BookingPricingSnapshot(
                2,
                "BKG-1:0",
                "BKG-1",
                0,
                booking.revision(),
                input.fingerprint(),
                LocalDate.parse("2026-08-01"),
                "TARIFF",
                "tariff:NA-EU",
                null,
                lines,
                List.of(),
                new BigDecimal("260.00"),
                "USD",
                NOW,
                "corr-1",
                NOW.plusSeconds(1));
    }

    private static PricingLineSnapshot line(
            String code,
            String category,
            String rateCategory,
            String amount,
            String unitRate) {
        return new PricingLineSnapshot(
                code,
                category,
                rateCategory,
                "PER_CONTAINER",
                2,
                new BigDecimal(unitRate),
                new BigDecimal(amount),
                "USD",
                "rate-" + code);
    }

    private static final class MutableBookings implements BookingRepository {
        private Booking value;
        private final List<String> events;

        private MutableBookings(Booking value, List<String> events) {
            this.value = value;
            this.events = events;
        }

        @Override
        public Booking save(Booking booking) {
            events.add("booking-save");
            value = booking;
            return booking;
        }

        @Override
        public Optional<Booking> findById(BookingId id) {
            return Optional.of(value);
        }

        @Override
        public Optional<Booking> findByIdForUpdate(BookingId id) {
            events.add("booking-lock");
            return Optional.of(value);
        }
    }

    private static final class RecordingReceipts implements PricingOperationReceiptPort {
        private final List<String> events;

        private RecordingReceipts(List<String> events) {
            this.events = events;
        }

        @Override
        public ClaimResult claim(ClaimCommand command) {
            events.add("receipt-claim");
            return new ClaimResult(ClaimDisposition.CLAIMED, receipt(command));
        }

        @Override
        public Optional<Receipt> find(String receiptKey) {
            events.add("receipt-find");
            return Optional.empty();
        }

        @Override
        public CompletionResult complete(CompletionCommand command) {
            events.add("receipt-complete");
            return new CompletionResult(CompletionDisposition.COMPLETED, command.response());
        }

        private static Receipt receipt(ClaimCommand command) {
            return new Receipt(
                    command.receiptKey(),
                    command.bookingId(),
                    command.providerKey(),
                    command.inputHash(),
                    "IN_PROGRESS",
                    command.ownerToken(),
                    NOW.plus(Duration.ofSeconds(15)),
                    1,
                    1,
                    null,
                    null,
                    command.correlationId());
        }
    }

    private static final class RecordingSnapshots implements PricingSnapshotRepository {
        private final List<String> events;
        private PricingSnapshot current;

        private RecordingSnapshots(List<String> events) {
            this.events = events;
        }

        @Override
        public void append(BookingId bookingId, PricingSnapshot snapshot) {
            events.add("history-append");
            current = snapshot;
        }

        @Override
        public PricingHistoryPage findHistory(BookingId bookingId, String cursor, int limit) {
            return new PricingHistoryPage(current, List.of(), null);
        }
    }
}
