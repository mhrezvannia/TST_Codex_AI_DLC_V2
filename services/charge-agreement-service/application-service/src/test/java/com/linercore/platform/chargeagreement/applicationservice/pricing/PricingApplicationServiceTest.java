package com.linercore.platform.chargeagreement.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.linercore.platform.chargeagreement.applicationservice.PricingConflictException;
import com.linercore.platform.chargeagreement.applicationservice.PricingRequestInProgressException;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.OwnedPricingCompletion;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestStatus;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingTerminalReceipt;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredPricingReceipt;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.pricing.PricingCalculator;
import com.linercore.platform.chargeagreement.domain.pricing.PricingResolution;
import com.linercore.platform.chargeagreement.domain.pricing.PricingTerminalReason;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class PricingApplicationServiceTest {
    private static final Instant TERMINAL_AT = Instant.parse("2026-07-28T10:00:00Z");

    @Test
    void authorizationDenialStopsBeforeReceiptAndResolutionReads() {
        AuthorizationPort authorization = (subject, resource, action, correlation) -> false;
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        PricingApplicationService service = service(authorization, receipts, resolver, mock(PricingTerminalRenderer.class));

        assertThrows(SecurityException.class,
                () -> service.requestPricing(request(), "BK-1:2", "booking-service"));

        verify(receipts, never()).findReceiptByIdempotencyKey(any());
        verify(resolver, never()).resolve(any());
    }

    @Test
    void terminalReplayReturnsStoredBytesWithoutResolverOrRenderer() {
        PricingRequest request = request();
        PricingRequestCanonicalizer canonicalizer = new PricingRequestCanonicalizer();
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        PricingTerminalRenderer renderer = mock(PricingTerminalRenderer.class);
        byte[] exact = "{\"exact\":\"é\"}".getBytes(StandardCharsets.UTF_8);
        PricingTerminalReceipt terminal = new PricingTerminalReceipt(
                200, "pricing.v1", request.pricingRequestId(), "PRICED", exact,
                request.correlationId(), TERMINAL_AT, null);
        when(receipts.findReceiptByIdempotencyKey(request.pricingRequestId())).thenReturn(Optional.of(
                new StoredPricingReceipt(
                        request.pricingRequestId(), request.bookingRef(), 2, canonicalizer.hash(request),
                        PricingRequestStatus.COMPLETED, "owner", TERMINAL_AT,
                        request.correlationId(), TERMINAL_AT, terminal)));

        PricingProviderResponse response = service(
                allow(), receipts, resolver, renderer).requestPricing(
                        request, request.pricingRequestId(), "booking-service");

        assertEquals(200, response.httpStatus());
        assertEquals(true, response.replayed());
        assertArrayEquals(exact, response.body());
        verify(resolver, never()).resolve(any());
        verify(renderer, never()).renderSuccess(any());
    }

    @Test
    void manualOutcomeUsesOneTerminalTimeAndCanonicalCaseInsideFencedCompletion() {
        PricingRequest request = request();
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        PricingTerminalRenderer renderer = mock(PricingTerminalRenderer.class);
        when(receipts.findReceiptByIdempotencyKey(request.pricingRequestId())).thenReturn(Optional.empty());
        when(receipts.insertClaim(any(), any())).thenReturn(true);
        when(resolver.resolve(request)).thenReturn(
                new PricingResolution.Manual(PricingTerminalReason.NO_RATE));
        when(renderer.renderManual(any(), any(), any(), any())).thenAnswer(invocation ->
                ("{\"manualCaseId\":\"" + invocation.getArgument(2) + "\"}")
                        .getBytes(StandardCharsets.UTF_8));
        when(receipts.completeOwned(any())).thenAnswer(invocation -> {
            OwnedPricingCompletion completion = invocation.getArgument(0);
            PricingTerminalReceipt terminal = completion.terminalFactory()
                    .create(completion.proposedManualCase().caseId());
            assertEquals(TERMINAL_AT, completion.proposedManualCase().openedAt());
            assertEquals(TERMINAL_AT, terminal.completedAt());
            return PricingRequestRepository.CompletionResult.completed(terminal);
        });

        PricingProviderResponse response = service(
                allow(), receipts, resolver, renderer).requestPricing(
                        request, request.pricingRequestId(), "booking-service");

        assertEquals(404, response.httpStatus());
        assertEquals(false, response.replayed());
        verify(receipts).completeOwned(any());
    }

    @Test
    void changedBodyForSameKeyIsConflictBeforeResolutionOrCompletion() {
        PricingRequest request = request();
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        when(receipts.findReceiptByIdempotencyKey(request.pricingRequestId())).thenReturn(Optional.of(
                new StoredPricingReceipt(
                        request.pricingRequestId(), request.bookingRef(), 2, "f".repeat(64),
                        PricingRequestStatus.IN_PROGRESS, "owner", TERMINAL_AT.plusSeconds(10),
                        request.correlationId(), TERMINAL_AT, null)));

        assertThrows(PricingConflictException.class, () -> service(
                allow(), receipts, resolver, mock(PricingTerminalRenderer.class)).requestPricing(
                        request, request.pricingRequestId(), "booking-service"));

        verify(resolver, never()).resolve(any());
        verify(receipts, never()).completeOwned(any());
    }

    @Test
    void liveOwnerReturnsInProgressWithoutResolutionOrManualCase() {
        PricingRequest request = request();
        PricingRequestCanonicalizer canonicalizer = new PricingRequestCanonicalizer();
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        when(receipts.findReceiptByIdempotencyKey(request.pricingRequestId())).thenReturn(Optional.of(
                new StoredPricingReceipt(
                        request.pricingRequestId(), request.bookingRef(), 2, canonicalizer.hash(request),
                        PricingRequestStatus.IN_PROGRESS, "owner", TERMINAL_AT.plusSeconds(10),
                        request.correlationId(), TERMINAL_AT, null)));
        when(receipts.takeOverExpiredClaim(any(), any(), any())).thenReturn(false);

        assertThrows(PricingRequestInProgressException.class, () -> service(
                allow(), receipts, resolver, mock(PricingTerminalRenderer.class)).requestPricing(
                        request, request.pricingRequestId(), "booking-service"));

        verify(resolver, never()).resolve(any());
        verify(receipts, never()).completeOwned(any());
    }

    @Test
    void malformedIdempotencyKeyStopsBeforeClaimAndResolution() {
        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);

        assertThrows(IllegalArgumentException.class, () -> service(
                allow(), receipts, resolver, mock(PricingTerminalRenderer.class)).requestPricing(
                        request(), "different-key", "booking-service"));

        verify(receipts, never()).findReceiptByIdempotencyKey(any());
        verify(resolver, never()).resolve(any());
    }

    @Test
    void telemetryUsesOnlyBoundedDimensionsForDeniedManualAndCaseReuseOutcomes() {
        List<PricingTelemetry.Signal> signals = new ArrayList<>();
        PricingRequestRepository deniedReceipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver deniedResolver = mock(PricingAuthorityResolver.class);
        PricingApplicationService denied = service(
                (subject, resource, action, correlation) -> false,
                deniedReceipts,
                deniedResolver,
                mock(PricingTerminalRenderer.class),
                signals::add);
        assertThrows(SecurityException.class,
                () -> denied.requestPricing(request(), request().pricingRequestId(), "booking-service"));

        PricingRequestRepository receipts = mock(PricingRequestRepository.class);
        PricingAuthorityResolver resolver = mock(PricingAuthorityResolver.class);
        PricingTerminalRenderer renderer = mock(PricingTerminalRenderer.class);
        when(receipts.findReceiptByIdempotencyKey(request().pricingRequestId())).thenReturn(Optional.empty());
        when(receipts.insertClaim(any(), any())).thenReturn(true);
        when(resolver.resolve(any())).thenReturn(
                new PricingResolution.Manual(PricingTerminalReason.NO_RATE));
        when(renderer.renderManual(any(), any(), any(), any()))
                .thenReturn("{\"manual\":true}".getBytes(StandardCharsets.UTF_8));
        when(receipts.completeOwned(any())).thenAnswer(invocation -> {
            OwnedPricingCompletion completion = invocation.getArgument(0);
            return PricingRequestRepository.CompletionResult.completed(
                    completion.terminalFactory().create("canonical-legacy-winner"));
        });

        service(allow(), receipts, resolver, renderer, signals::add)
                .requestPricing(request(), request().pricingRequestId(), "booking-service");

        assertEquals(List.of(
                        PricingTelemetry.Outcome.DENIED,
                        PricingTelemetry.Outcome.CASE_REUSE,
                        PricingTelemetry.Outcome.MANUAL),
                signals.stream().map(PricingTelemetry.Signal::outcome).toList());
        assertEquals(PricingTelemetry.ManualReason.NO_RATE, signals.getLast().manualReason());
        assertEquals(PricingTelemetry.Basis.NONE, signals.getLast().basis());
        String serialized = signals.toString();
        for (String forbidden : List.of(
                "BK-1", "party-1", "corr-1", "booking-service", "canonical-legacy-winner",
                "manual:true", "owner", "10.00", "a".repeat(64))) {
            assertEquals(false, serialized.contains(forbidden));
        }
    }

    private PricingApplicationService service(
            AuthorizationPort authorization,
            PricingRequestRepository receipts,
            PricingAuthorityResolver resolver,
            PricingTerminalRenderer renderer) {
        return service(authorization, receipts, resolver, renderer, PricingTelemetry.NOOP);
    }

    private PricingApplicationService service(
            AuthorizationPort authorization,
            PricingRequestRepository receipts,
            PricingAuthorityResolver resolver,
            PricingTerminalRenderer renderer,
            PricingTelemetry telemetry) {
        AtomicInteger sequence = new AtomicInteger();
        return new PricingApplicationService(
                authorization, receipts, resolver, new PricingCalculator(),
                new PricingRequestCanonicalizer(), renderer,
                () -> "generated-" + sequence.incrementAndGet(),
                Clock.fixed(TERMINAL_AT, ZoneOffset.UTC),
                telemetry);
    }

    private AuthorizationPort allow() {
        return (subject, resource, action, correlation) -> true;
    }

    private PricingRequest request() {
        LocalDate date = LocalDate.parse("2026-08-01");
        return new PricingRequest(
                "BK-1", "lane-1", "USNYC", "NLRTM", "22G1", "party-1", "commodity-1",
                false, false, new PricingRequest.PricingDates(date, date),
                new PricingRequest.PricingQuantities(2, 4, 2), "corr-1");
    }
}
