package com.linercore.platform.booking.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingHistoryPort;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingOrchestrator;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingCaptureService;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingCompletionService;
import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingPricingOutcome;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.PricingFailureEvidence;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.time.Clock;
import java.time.Instant;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class BookingApiControllerTest {
    private final BookingApplicationService service = mock(BookingApplicationService.class);
    private final BookingApiController controller = new BookingApiController(service);

    @Test
    void mapsCanonicalCreateFieldsAndHeaders() {
        when(service.createDraft(any())).thenReturn(booking());
        BookingApiController.CreateBookingRequest request = new BookingApiController.CreateBookingRequest(
                "customer-1",
                List.of(new BookingApiController.RoutingLegRequest(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new BookingApiController.EquipmentAssignmentRequest("45G1", 1, "MSCU6639870")),
                "USD", "FCL_DRY", false, false, Map.of("commodityCode", "GENERAL"));

        BookingApiController.BookingResponse response = controller.create(request, "idem-1", "local-user", "corr-1")
                .getBody();

        ArgumentCaptor<CreateBookingCommand> command = ArgumentCaptor.forClass(CreateBookingCommand.class);
        verify(service).createDraft(command.capture());
        assertEquals("idem-1", command.getValue().idempotencyKey());
        assertEquals("USNYC", command.getValue().routing().get(0).loadUnLocode());
        assertEquals("MSCU6639870", command.getValue().equipment().get(0).equipmentId());
        assertEquals("USNYC", response.routing().get(0).loadUnLocode());
        assertEquals("45G1", response.equipment().get(0).equipmentTypeCode());
    }

    @Test
    void requiresIdempotencyHeader() {
        BookingApiController.CreateBookingRequest request = new BookingApiController.CreateBookingRequest(
                "customer-1", List.of(), List.of(), "USD", "FCL_DRY", false, false, Map.of());

        assertThrows(IllegalArgumentException.class, () -> controller.create(request, null, "local-user", "corr-1"));
    }

    @Test
    void requiresActorAndCorrelationHeaders() {
        BookingApiController.CreateBookingRequest request = new BookingApiController.CreateBookingRequest(
                "customer-1", List.of(), List.of(), "USD", "FCL_DRY", false, false, Map.of());

        assertThrows(IllegalArgumentException.class, () -> controller.create(request, "idem-1", null, "corr-1"));
        assertThrows(IllegalArgumentException.class, () -> controller.create(request, "idem-1", "local-user", null));
    }

    @Test
    void readPathsRequireActorHeader() {
        assertThrows(IllegalArgumentException.class, () -> controller.recent(null, null, null, 0, 25, "corr-1"));
        assertThrows(IllegalArgumentException.class, () -> controller.detail("booking-1", " ", "corr-1"));
    }

    @Test
    void mapsDomainValidationToCanonicalFieldPaths() {
        BookingApiController.ApiErrorResponse response = controller.badRequest(
                new IllegalArgumentException("load and discharge UN/LOCODE must differ")).getBody();

        assertEquals("BOOKING_VALIDATION", response.code());
        assertEquals(List.of("routing[0].dischargeUnLocode"), response.fields());
    }

    @Test
    void mapsReferenceProviderFailureToRetryableSafeContract() {
        var response = controller.referenceUnavailable(new ReferenceProviderUnavailable(
                ReferenceProviderFailureCategory.THROTTLED, "Reference Data is temporarily throttled", "corr-ref",
                Duration.ofSeconds(2)));

        assertEquals(503, response.getStatusCode().value());
        assertEquals("REFERENCE_DATA_UNAVAILABLE", response.getBody().code());
        assertEquals("corr-ref", response.getBody().correlationId());
        assertEquals("2", response.getHeaders().getFirst("Retry-After"));
    }

    @Test
    void confirmRequiresAndPassesIdempotencyHeader() {
        when(service.confirm(any(), eq("local-user"), eq("confirm-idem-1"), eq("corr-1"))).thenReturn(booking());

        BookingApiController.BookingResponse response = controller.confirm("booking-1",
                new BookingApiController.ActorRequest("local-user", null), "confirm-idem-1", "corr-1");

        verify(service).confirm(any(), eq("local-user"), eq("confirm-idem-1"), eq("corr-1"));
        assertEquals("booking-1", response.id());
        assertThrows(IllegalArgumentException.class, () -> controller.confirm("booking-1",
                new BookingApiController.ActorRequest("local-user", null), null, "corr-1"));
    }

    @Test
    void deniesPricingBeforeBookingExistenceIsReadAndSerializesOnlySafeContract() throws Exception {
        BookingRepository bookings = mock(BookingRepository.class);
        AuthorizationPort authorization = mock(AuthorizationPort.class);
        when(authorization.allowed("denied-user", "booking", "request-pricing", "corr-denied"))
                .thenReturn(false);
        PricingOperationReceiptPort receipts = mock(PricingOperationReceiptPort.class);
        PricingSnapshotRepository snapshots = mock(PricingSnapshotRepository.class);
        BookingPricingOrchestrator orchestrator = new BookingPricingOrchestrator(
                new BookingPricingCaptureService(bookings, authorization, receipts, () -> "owner-1"),
                new BookingPricingCompletionService(bookings, receipts, snapshots, Clock.systemUTC()),
                mock(PricingPort.class),
                receipts,
                mock(PricingHistoryPort.class),
                Clock.systemUTC());
        BookingApiController pricingController = new BookingApiController(service, orchestrator);

        SecurityException denied = assertThrows(SecurityException.class, () -> pricingController.price(
                "missing-booking",
                new BookingApiController.PricingRequest("idem-1", "denied-user", "corr-denied"),
                "corr-denied"));
        var serialized = new ObjectMapper().findAndRegisterModules()
                .writeValueAsString(pricingController.forbidden(denied).getBody());

        verifyNoInteractions(bookings);
        org.junit.jupiter.api.Assertions.assertTrue(serialized.contains("\"code\":\"forbidden\""));
        org.junit.jupiter.api.Assertions.assertFalse(serialized.contains("missing-booking"));
        org.junit.jupiter.api.Assertions.assertFalse(serialized.contains("idem-1"));
    }

    @Test
    void serializesManualEvidenceAndBoundedCurrentPriorHistoryWithRealJackson() throws Exception {
        BookingPricingOrchestrator orchestrator = mock(BookingPricingOrchestrator.class);
        PricingCommandResult manual = failure(BookingPricingOutcome.MANUAL_PRICING_REQUIRED, "NO_RATE", 0);
        PricingSnapshot current = legacy("price-current", "quote-current", "corr-current");
        PricingSnapshot prior = legacy("price-prior", "quote-prior", "corr-prior");
        when(orchestrator.price(any(), eq("booking-user"), eq("corr-manual"))).thenReturn(manual);
        when(orchestrator.history(any(), eq(null), eq(25)))
                .thenReturn(new PricingHistoryPage(current, List.of(prior), "next-cursor"));
        BookingApiController pricingController = new BookingApiController(service, orchestrator);

        var response = pricingController.price(
                "booking-1",
                new BookingApiController.PricingRequest("idem-price", "booking-user", "corr-manual"),
                "corr-manual");
        String json = new ObjectMapper().findAndRegisterModules().writeValueAsString(response.getBody());

        assertEquals(422, response.getStatusCode().value());
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"outcome\":\"MANUAL_PRICING_REQUIRED\""));
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"reasonCode\":\"NO_RATE\""));
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"current\""));
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"prior\""));
        org.junit.jupiter.api.Assertions.assertFalse(json.contains("\"total\""));
    }

    @Test
    void preservesTypedNegativeStatusesAndRetryGuidance() {
        BookingPricingOrchestrator orchestrator = mock(BookingPricingOrchestrator.class);
        when(orchestrator.history(any(), eq(null), eq(25)))
                .thenReturn(new PricingHistoryPage(null, List.of(), null));
        BookingApiController pricingController = new BookingApiController(service, orchestrator);
        Map<BookingPricingOutcome, Integer> expected = Map.of(
                BookingPricingOutcome.DENIED, 403,
                BookingPricingOutcome.MALFORMED, 502,
                BookingPricingOutcome.VALIDATION_FAILED, 422,
                BookingPricingOutcome.CONFLICT, 409,
                BookingPricingOutcome.TIMEOUT, 504,
                BookingPricingOutcome.CIRCUIT_OPEN, 503);

        expected.forEach((outcome, status) -> {
            when(orchestrator.price(any(), eq("booking-user"), eq("corr-negative")))
                    .thenReturn(failure(outcome, outcome.name(), outcome == BookingPricingOutcome.CIRCUIT_OPEN ? 5 : 0));
            var response = pricingController.price(
                    "booking-1",
                    new BookingApiController.PricingRequest("idem-price", "booking-user", "corr-negative"),
                    "corr-negative");
            assertEquals(status, response.getStatusCode().value());
            if (outcome == BookingPricingOutcome.CIRCUIT_OPEN) {
                assertEquals("5", response.getHeaders().getFirst("Retry-After"));
            }
        });
    }

    private PricingCommandResult failure(BookingPricingOutcome outcome, String reason, int retryAfter) {
        return new PricingCommandResult(
                outcome,
                outcome == BookingPricingOutcome.MANUAL_PRICING_REQUIRED ? "price-1" : null,
                1,
                "a".repeat(64),
                null,
                null,
                new PricingFailureEvidence(reason, reason, null, null, 1, null, null,
                        "corr-" + reason.toLowerCase(), Instant.parse("2026-07-29T10:00:00Z"), 1),
                retryAfter,
                outcome == BookingPricingOutcome.MANUAL_PRICING_REQUIRED ? "corr-manual" : "corr-negative");
    }

    private PricingSnapshot legacy(String requestId, String quoteId, String correlationId) {
        return new PricingSnapshot(
                requestId,
                quoteId,
                "QUOTED",
                Map.of("currency", "USD"),
                Instant.parse("2026-07-01T00:00:00Z"),
                correlationId);
    }

    private Booking booking() {
        return Booking.draft(new BookingId("booking-1"), "BKG-1", "customer-1",
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")), "USD", "FCL_DRY", false, false,
                Map.of(), "local-user", "corr-1", Instant.parse("2026-07-01T00:00:00Z"));
    }
}
