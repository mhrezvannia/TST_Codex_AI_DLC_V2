package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingHistoryPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class BookingPricingOrchestratorTest {
    private static final Instant NOW = Instant.parse("2026-07-29T10:00:00Z");
    private final Booking booking = PricingInputTest.booking("2026-08-01");

    @Test
    void authorizationHappensBeforeBookingLookup() {
        BookingRepository forbiddenLookup = repository(() -> {
            throw new AssertionError("lookup must not occur");
        });
        BookingPricingOrchestrator service = service(
                forbiddenLookup, (subject, resource, action, correlation) -> false,
                new FakePricing(), new FakeReceipts(), (id, cursor, limit) -> new PricingHistoryPage(null, List.of(), null));

        assertThrows(SecurityException.class,
                () -> service.price(booking.id(), "denied", "corr-1"));
    }

    @Test
    void capturedAttemptUsesExactBodyKeyAndCompletesAfterProviderCall() {
        FakePricing provider = new FakePricing();
        FakeReceipts receipts = new FakeReceipts();
        provider.result = new PricingPortResult.Priced(snapshot());
        BookingPricingOrchestrator service = service(repository(() -> booking), allow(), provider, receipts, emptyHistory());

        PricingCommandResult result = service.price(booking.id(), "booking-user", "corr-1");

        assertEquals(BookingPricingOutcome.PRICED, result.outcome());
        assertEquals("BKG-1:0", provider.attempt.providerKey());
        assertEquals(provider.attempt.input().fingerprint(), provider.attempt.inputHash());
        assertEquals(List.of("claim", "provider", "complete"), receipts.events);
    }

    @Test
    void completedReceiptReplaysWithoutProviderCall() {
        FakePricing provider = new FakePricing();
        FakeReceipts receipts = new FakeReceipts();
        PricingInput input = PricingInput.from(booking, 0);
        PricingCommandResult replay = diagnostic(BookingPricingOutcome.CONFLICT, input);
        receipts.claimDisposition = PricingOperationReceiptPort.ClaimDisposition.REPLAY;
        receipts.storedResponse = replay;

        PricingCommandResult result =
                service(repository(() -> booking), allow(), provider, receipts, emptyHistory())
                        .price(booking.id(), "booking-user", "corr-1");

        assertEquals(replay, result);
        assertEquals(0, provider.calls);
    }

    @Test
    void staleOwnerReturnsRecordedWinner() {
        FakePricing provider = new FakePricing();
        FakeReceipts receipts = new FakeReceipts();
        PricingInput input = PricingInput.from(booking, 0);
        PricingCommandResult winner = diagnostic(BookingPricingOutcome.UNAVAILABLE, input);
        provider.result = new PricingPortResult.Denied("DENIED", "corr-1");
        receipts.completionDisposition = PricingOperationReceiptPort.CompletionDisposition.STALE_OWNER;
        receipts.storedResponse = winner;

        PricingCommandResult result =
                service(repository(() -> booking), allow(), provider, receipts, emptyHistory())
                        .price(booking.id(), "booking-user", "corr-1");

        assertEquals(winner, result);
    }

    @Test
    void manualNoRateKeepsEvidenceWithoutMoney() {
        FakePricing provider = new FakePricing();
        provider.result = new PricingPortResult.ManualRequired(
                "NO_RATE", "price-1", "case-1", "corr-1", "No rate");

        PricingCommandResult result =
                service(repository(() -> booking), allow(), provider, new FakeReceipts(), emptyHistory())
                        .price(booking.id(), "booking-user", "corr-1");

        assertEquals(BookingPricingOutcome.MANUAL_PRICING_REQUIRED, result.outcome());
        assertEquals("NO_RATE", result.failureEvidence().reasonCode());
        assertNull(result.typedSnapshot());
        assertNull(result.legacySnapshot());
    }

    @Test
    void malformedTypedIdentityIsNotAttached() {
        FakePricing provider = new FakePricing();
        BookingPricingSnapshot candidate = snapshot();
        provider.result = new PricingPortResult.Priced(new BookingPricingSnapshot(
                2, candidate.pricingRequestId(), candidate.bookingRef(), 1, candidate.bookingRevision(),
                candidate.inputFingerprint(), candidate.requestedDepartureDate(), candidate.pricingBasis(),
                candidate.pricingRef(), candidate.agreementVersionId(), candidate.lines(),
                candidate.applicableDndRuleTypes(), candidate.total(), candidate.currency(), candidate.pricedAt(),
                candidate.correlationId(), candidate.createdAt()));

        PricingCommandResult result =
                service(repository(() -> booking), allow(), provider, new FakeReceipts(), emptyHistory())
                        .price(booking.id(), "booking-user", "corr-1");

        assertEquals(BookingPricingOutcome.MALFORMED, result.outcome());
        assertNull(result.typedSnapshot());
    }

    @Test
    void historyLimitIsBoundedToFifty() {
        int[] observed = new int[1];
        PricingHistoryPort history = (id, cursor, limit) -> {
            observed[0] = limit;
            return new PricingHistoryPage(null, List.of(), null);
        };

        service(repository(() -> booking), allow(), new FakePricing(), new FakeReceipts(), history)
                .history(booking.id(), null, 500);

        assertEquals(50, observed[0]);
    }

    private BookingPricingOrchestrator service(
            BookingRepository repository,
            com.linercore.platform.booking.applicationservice.port.AuthorizationPort authorization,
            FakePricing provider,
            FakeReceipts receipts,
            PricingHistoryPort history) {
        receipts.provider = provider;
        PricingSnapshotRepository snapshots = new PricingSnapshotRepository() {
            @Override
            public void append(
                    BookingId bookingId,
                    com.linercore.platform.booking.domain.model.PricingSnapshot snapshot) {
                // Publication is asserted in the focused completion service tests.
            }

            @Override
            public PricingHistoryPage findHistory(BookingId id, String cursor, int limit) {
                return history.findHistory(id, cursor, limit);
            }
        };
        BookingPricingCaptureService capture = new BookingPricingCaptureService(
                repository, authorization, receipts, () -> "owner-1");
        BookingPricingCompletionService completion = new BookingPricingCompletionService(
                repository, receipts, snapshots, Clock.fixed(NOW, ZoneOffset.UTC));
        return new BookingPricingOrchestrator(
                capture,
                completion,
                provider,
                receipts,
                history,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static com.linercore.platform.booking.applicationservice.port.AuthorizationPort allow() {
        return (subject, resource, action, correlation) -> true;
    }

    private static PricingHistoryPort emptyHistory() {
        return (id, cursor, limit) -> new PricingHistoryPage(null, List.of(), null);
    }

    private static BookingRepository repository(java.util.function.Supplier<Booking> bookingSupplier) {
        return new BookingRepository() {
            @Override
            public Booking save(Booking value) {
                return value;
            }

            @Override
            public Optional<Booking> findById(BookingId id) {
                return Optional.ofNullable(bookingSupplier.get());
            }
        };
    }

    private BookingPricingSnapshot snapshot() {
        PricingInput input = PricingInput.from(booking, 0);
        List<PricingLineSnapshot> lines = List.of(
                line("OFR", "FREIGHT", "BASE", "100.00"),
                line("BAF", "SURCHARGE", "SURCHARGE", "20.00"),
                line("THC", "LOCAL", "LOCAL", "5.00"));
        return new BookingPricingSnapshot(
                2, "price-1", "BKG-1", 0, booking.revision(), input.fingerprint(),
                LocalDate.parse("2026-08-01"), "TARIFF", "tariff:NA-EU", null, lines, List.of(),
                new BigDecimal("125.00"), "USD", NOW, "corr-1", NOW);
    }

    private static PricingLineSnapshot line(String code, String category, String rateCategory, String amount) {
        return new PricingLineSnapshot(code, category, rateCategory, "PER_CONTAINER", 1,
                new BigDecimal(amount), new BigDecimal(amount), "USD", "rate-" + code);
    }

    private static PricingCommandResult diagnostic(BookingPricingOutcome outcome, PricingInput input) {
        return new PricingCommandResult(outcome, null, input.amendmentSeq(), input.fingerprint(),
                null, null, null, 0, "corr-1");
    }

    private static final class FakePricing implements PricingPort {
        private PricingPortResult result = new PricingPortResult.Denied("DENIED", "corr-1");
        private PricingAttempt attempt;
        private int calls;

        @Override
        public PricingRequestResult requestPricing(Booking value, String key, String correlationId) {
            throw new AssertionError("typed attempt overload is required");
        }

        @Override
        public PricingPortResult requestPricing(PricingAttempt value) {
            calls++;
            attempt = value;
            return result;
        }
    }

    private static final class FakeReceipts implements PricingOperationReceiptPort {
        private final java.util.ArrayList<String> events = new java.util.ArrayList<>();
        private ClaimDisposition claimDisposition = ClaimDisposition.CLAIMED;
        private CompletionDisposition completionDisposition = CompletionDisposition.COMPLETED;
        private PricingCommandResult storedResponse;
        private FakePricing provider;
        private ClaimCommand claim;

        @Override
        public ClaimResult claim(ClaimCommand command) {
            events.add("claim");
            claim = command;
            return new ClaimResult(claimDisposition, receipt(storedResponse));
        }

        @Override
        public Optional<Receipt> find(String receiptKey) {
            return storedResponse == null ? Optional.empty() : Optional.of(receipt(storedResponse));
        }

        @Override
        public CompletionResult complete(CompletionCommand command) {
            if (provider != null && provider.calls > 0) {
                events.add("provider");
            }
            events.add("complete");
            PricingCommandResult response = completionDisposition == CompletionDisposition.COMPLETED
                    ? command.response()
                    : storedResponse;
            if (completionDisposition == CompletionDisposition.COMPLETED) {
                storedResponse = response;
            }
            return new CompletionResult(completionDisposition, response);
        }

        private Receipt receipt(PricingCommandResult response) {
            PricingInput input = PricingInput.from(PricingInputTest.booking("2026-08-01"), 0);
            return new Receipt(
                    "P|BKG-1:0",
                    new BookingId("booking-1"),
                    "BKG-1:0",
                    input.fingerprint(),
                    response == null ? "IN_PROGRESS" : "COMPLETED",
                    "owner-1",
                    NOW.plusSeconds(15),
                    1,
                    1,
                    null,
                    response,
                    "corr-1");
        }
    }
}
