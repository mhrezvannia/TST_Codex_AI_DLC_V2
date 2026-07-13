package com.linercore.platform.booking.container.api;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingException;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.DndTriggerCandidate;
import com.linercore.platform.booking.domain.model.LifecycleEvent;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.container.integration.HttpContainerMovementClient;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingApiController {
    private final BookingApplicationService service;
    private final HttpContainerMovementClient containerMovementClient;

    public BookingApiController(BookingApplicationService service, HttpContainerMovementClient containerMovementClient) {
        this.service = service;
        this.containerMovementClient = containerMovementClient;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @RequestBody CreateBookingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        Booking booking = service.createDraft(new CreateBookingCommand(
                request.idempotencyKey(),
                request.customerId(),
                request.originLocationId(),
                request.destinationLocationId(),
                request.equipmentType(),
                request.attributes(),
                actor(request.actorSubjectId()),
                correlation(correlationId, request.correlationId())));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(booking));
    }

    @PostMapping("/drafts")
    public ResponseEntity<BookingResponse> createDraft(
            @RequestBody CreateBookingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return create(request, correlationId);
    }

    @GetMapping("/{id}")
    public BookingResponse detail(
            @PathVariable("id") String id,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.detail(new BookingId(id), actor, correlation(correlationId, null)));
    }

    @GetMapping
    public BookingListResponse recent(
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestParam(name = "limit", defaultValue = "25") int limit,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        List<BookingResponse> items = service.recent(actor, correlation(correlationId, null), limit).stream()
                .map(this::toResponse)
                .toList();
        return new BookingListResponse(items, items.size());
    }

    @PostMapping("/{id}/validate")
    public BookingResponse validate(
            @PathVariable("id") String id,
            @RequestBody ActorRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.validate(new BookingId(id), actor(request.actorSubjectId()),
                correlation(correlationId, request.correlationId())));
    }

    @PostMapping("/{id}/price")
    public BookingResponse price(
            @PathVariable("id") String id,
            @RequestBody PricingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.requestPricing(new BookingId(id), actor(request.actorSubjectId()),
                required(request.idempotencyKey(), "idempotency key is required"),
                correlation(correlationId, request.correlationId())));
    }

    @PostMapping("/{id}/pricing-snapshot")
    public BookingResponse storePricingSnapshot(
            @PathVariable("id") String id,
            @RequestBody PricingSnapshotRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.storePricingSnapshot(new BookingId(id), new PricingSnapshotCommand(
                request.pricingRequestId(),
                request.pricingQuoteId(),
                request.status(),
                request.quotedAmounts(),
                actor(request.actorSubjectId()),
                correlation(correlationId, request.correlationId()))));
    }

    @PostMapping("/{id}/confirm")
    public BookingResponse confirm(
            @PathVariable("id") String id,
            @RequestBody ActorRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        Booking booking = service.confirm(new BookingId(id), actor(request.actorSubjectId()), resolvedCorrelation);
        containerMovementClient.publishBookingConfirmed(booking, resolvedCorrelation);
        return toResponse(booking);
    }

    @PostMapping("/{id}/amend")
    public BookingResponse amend(
            @PathVariable("id") String id,
            @RequestBody AmendBookingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.amend(new BookingId(id), request.attributes(), actor(request.actorSubjectId()),
                correlation(correlationId, request.correlationId())));
    }

    @PostMapping("/{id}/reconfirm")
    public BookingResponse reconfirm(
            @PathVariable("id") String id,
            @RequestBody ActorRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        Booking booking = service.reconfirm(new BookingId(id), actor(request.actorSubjectId()), resolvedCorrelation);
        containerMovementClient.publishBookingConfirmed(booking, resolvedCorrelation);
        return toResponse(booking);
    }

    @PostMapping("/movement-status")
    public BookingResponse receiveMovementStatus(@RequestBody MovementStatusRequest request) {
        return toResponse(service.consumeMovementStatus(new MovementStatusReceivedEvent(
                request.eventId(),
                request.eventType(),
                request.schemaVersion(),
                request.source(),
                request.occurredAt(),
                request.correlationId(),
                request.idempotencyKey(),
                request.containerId(),
                request.bookingId(),
                request.movementStatus(),
                request.sequenceNumber(),
                request.statusReason(),
                request.lastKnownLocationId())));
    }

    private BookingResponse toResponse(Booking booking) {
        PricingSnapshot snapshot = booking.pricingSnapshot();
        return new BookingResponse(
                booking.id().value(),
                booking.bookingNumber(),
                booking.revision(),
                booking.status(),
                booking.customerId(),
                booking.originLocationId(),
                booking.destinationLocationId(),
                booking.equipmentType(),
                snapshot == null ? null : new PricingSnapshotResponse(snapshot.pricingRequestId(),
                        snapshot.pricingQuoteId(), snapshot.status(), snapshot.quotedAmounts(), snapshot.receivedAt(),
                        snapshot.correlationId()),
                booking.exceptions().stream().map(this::toException).toList(),
                booking.dndTriggerCandidates().stream().map(this::toDndCandidate).toList(),
                booking.lifecycleEvents().stream().map(this::toLifecycle).toList(),
                booking.attributes());
    }

    private BookingExceptionResponse toException(BookingException exception) {
        return new BookingExceptionResponse(exception.code(), exception.message(), exception.correlationId(),
                exception.occurredAt());
    }

    private DndTriggerCandidateResponse toDndCandidate(DndTriggerCandidate candidate) {
        return new DndTriggerCandidateResponse(candidate.candidateId(), candidate.reason(), candidate.correlationId(),
                candidate.recordedAt());
    }

    private LifecycleEventResponse toLifecycle(LifecycleEvent event) {
        return new LifecycleEventResponse(event.eventType(), event.status(), event.revision(), event.actorSubjectId(),
                event.correlationId(), event.occurredAt());
    }

    private String actor(String actorSubjectId) {
        return actorSubjectId == null || actorSubjectId.isBlank() ? "local-user" : actorSubjectId;
    }

    private String correlation(String headerCorrelationId, String bodyCorrelationId) {
        if (headerCorrelationId != null && !headerCorrelationId.isBlank()) {
            return headerCorrelationId;
        }
        if (bodyCorrelationId != null && !bodyCorrelationId.isBlank()) {
            return bodyCorrelationId;
        }
        return "local-correlation";
    }

    private String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiErrorResponse> notFound(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("not_found", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("bad_request", exception.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiErrorResponse> forbidden(SecurityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error("forbidden", exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> conflict(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error("conflict", exception.getMessage()));
    }

    private ApiErrorResponse error(String code, String message) {
        return new ApiErrorResponse(code, message == null ? code : message, List.of(), "local-correlation");
    }

    public record CreateBookingRequest(
            String idempotencyKey,
            String customerId,
            String originLocationId,
            String destinationLocationId,
            String equipmentType,
            Map<String, String> attributes,
            String actorSubjectId,
            String correlationId) {
    }

    public record ActorRequest(String actorSubjectId, String correlationId) {
    }

    public record PricingRequest(String idempotencyKey, String actorSubjectId, String correlationId) {
    }

    public record PricingSnapshotRequest(
            String pricingRequestId,
            String pricingQuoteId,
            String status,
            Map<String, String> quotedAmounts,
            String actorSubjectId,
            String correlationId) {
    }

    public record AmendBookingRequest(Map<String, String> attributes, String actorSubjectId, String correlationId) {
    }

    public record MovementStatusRequest(
            String eventId,
            String eventType,
            String schemaVersion,
            String source,
            Instant occurredAt,
            String correlationId,
            String idempotencyKey,
            String containerId,
            String bookingId,
            String movementStatus,
            long sequenceNumber,
            String statusReason,
            String lastKnownLocationId) {
    }

    public record BookingResponse(
            String id,
            String bookingNumber,
            int revision,
            BookingStatus status,
            String customerId,
            String originLocationId,
            String destinationLocationId,
            String equipmentType,
            PricingSnapshotResponse pricingSnapshot,
            List<BookingExceptionResponse> exceptions,
            List<DndTriggerCandidateResponse> dndTriggerCandidates,
            List<LifecycleEventResponse> lifecycleEvents,
            Map<String, String> attributes) {
    }

    public record BookingListResponse(List<BookingResponse> items, int returned) {
    }

    public record PricingSnapshotResponse(
            String pricingRequestId,
            String pricingQuoteId,
            String status,
            Map<String, String> quotedAmounts,
            Instant quotedAt,
            String correlationId) {
    }

    public record BookingExceptionResponse(String code, String message, String correlationId, Instant occurredAt) {
    }

    public record DndTriggerCandidateResponse(
            String candidateId,
            String reason,
            String correlationId,
            Instant detectedAt) {
    }

    public record LifecycleEventResponse(
            String eventType,
            BookingStatus status,
            int revision,
            String actorSubjectId,
            String correlationId,
            Instant occurredAt) {
    }

    public record ApiErrorResponse(String code, String message, List<String> fields, String correlationId) {
    }
}
