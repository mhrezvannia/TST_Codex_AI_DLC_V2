package com.linercore.platform.booking.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
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

    private Booking booking() {
        return Booking.draft(new BookingId("booking-1"), "BKG-1", "customer-1",
                List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")), "USD", "FCL_DRY", false, false,
                Map.of(), "local-user", "corr-1", Instant.parse("2026-07-01T00:00:00Z"));
    }
}
