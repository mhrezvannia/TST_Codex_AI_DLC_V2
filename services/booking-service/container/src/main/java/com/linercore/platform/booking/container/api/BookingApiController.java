package com.linercore.platform.booking.container.api;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingOrchestrator;
import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;
import com.linercore.platform.booking.applicationservice.command.CreateBookingCommand;
import com.linercore.platform.booking.applicationservice.command.PricingSnapshotCommand;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingException;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.DndTriggerCandidate;
import com.linercore.platform.booking.domain.model.LifecycleEvent;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import com.linercore.platform.booking.applicationservice.CommandInProgressException;
import com.linercore.platform.booking.applicationservice.BookingChangedException;
import com.linercore.platform.booking.applicationservice.IdempotencyConflictException;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.port.MovementLocation;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjection;
import com.linercore.platform.booking.domain.model.ReferenceFieldResult;
import com.linercore.platform.booking.domain.model.ReferenceValidationSnapshot;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final BookingPricingOrchestrator pricing;

    public BookingApiController(BookingApplicationService service) {
        this(service, null);
    }

    @Autowired
    public BookingApiController(
            BookingApplicationService service,
            BookingPricingOrchestrator pricing) {
        this.service = service;
        this.pricing = pricing;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @RequestBody CreateBookingRequest request,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(name = "X-LinerCore-Actor-Id", required = false) String actorSubjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        Booking booking = service.createDraft(new CreateBookingCommand(
                required(idempotencyKey, "Idempotency-Key header is required"),
                request.customerId(),
                request.routing().stream().map(RoutingLegRequest::toDomain).toList(),
                request.equipment().stream().map(EquipmentAssignmentRequest::toDomain).toList(),
                request.currency(),
                request.cargoMode(),
                request.reefer(),
                request.dangerousGoods(),
                request.attributes(),
                required(actorSubjectId, "X-LinerCore-Actor-Id header is required"),
                required(correlationId, "X-Correlation-Id header is required")));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(booking));
    }

    @PostMapping("/drafts")
    public ResponseEntity<BookingResponse> createDraft(
            @RequestBody CreateBookingRequest request,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(name = "X-LinerCore-Actor-Id", required = false) String actorSubjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return create(request, idempotencyKey, actorSubjectId, correlationId);
    }

    @GetMapping("/{id}")
    public BookingResponse detail(
            @PathVariable("id") String id,
            @RequestHeader(name = "X-LinerCore-Actor-Id", required = false) String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, null);
        BookingId bookingId = new BookingId(id);
        return toResponse(service.detail(bookingId, actor(actor), resolvedCorrelation),
                service.movementStatuses(bookingId, actor(actor), resolvedCorrelation), true);
    }

    @GetMapping
    public BookingListResponse recent(
            @RequestHeader(name = "X-LinerCore-Actor-Id", required = false) String actor,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) BookingStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        List<BookingResponse> items = service.search(actor(actor), correlation(correlationId, null), search, status,
                        page, size).stream()
                .map(this::toResponse)
                .toList();
        return new BookingListResponse(items, items.size(), Math.max(0, page), Math.max(1, Math.min(size, 100)));
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
    public ResponseEntity<?> price(
            @PathVariable("id") String id,
            @RequestBody PricingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        if (pricing == null) {
            return ResponseEntity.ok(toResponse(service.requestPricing(
                    new BookingId(id),
                    actor(request.actorSubjectId()),
                    required(request.idempotencyKey(), "idempotency key is required"),
                    resolvedCorrelation)));
        }
        PricingCommandResult result =
                pricing.price(new BookingId(id), actor(request.actorSubjectId()), resolvedCorrelation);
        PricingHistoryPage history = pricing.history(new BookingId(id), null, 25);
        ResponseEntity.BodyBuilder response = ResponseEntity.status(pricingStatus(result));
        if (result.retryAfterSeconds() > 0) {
            response.header("Retry-After", String.valueOf(result.retryAfterSeconds()));
        }
        return response.body(new PricingCommandResponse(result, history, result.confirmationEligible()));
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
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        Booking booking = service.confirm(new BookingId(id), actor(request.actorSubjectId()),
                required(idempotencyKey, "Idempotency-Key header is required"), resolvedCorrelation);
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
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        Booking booking = service.reconfirm(new BookingId(id), actor(request.actorSubjectId()),
                required(idempotencyKey, "Idempotency-Key header is required"), resolvedCorrelation);
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        return toResponse(booking, List.of(), false);
    }

    private BookingResponse toResponse(Booking booking, List<MovementStatusProjection> movementStatuses) {
        return toResponse(booking, movementStatuses, false);
    }

    private BookingResponse toResponse(
            Booking booking,
            List<MovementStatusProjection> movementStatuses,
            boolean includePricingHistory) {
        PricingSnapshot snapshot = booking.pricingSnapshot();
        ReferenceValidationSnapshot validation = booking.referenceValidationSnapshot();
        PricingHistoryPage history = includePricingHistory && pricing != null
                ? pricing.history(booking.id(), null, 25)
                : null;
        return new BookingResponse(
                booking.id().value(),
                booking.bookingNumber(),
                booking.revision(),
                booking.status(),
                booking.customerId(),
                booking.routing().stream().map(RoutingLegResponse::from).toList(),
                booking.equipment().stream().map(EquipmentAssignmentResponse::from).toList(),
                booking.currency(),
                booking.cargoMode(),
                booking.reefer(),
                booking.dangerousGoods(),
                booking.legacyIncomplete(),
                validation == null ? null : new ReferenceValidationResponse(
                        validation.bookingRevision(), validation.referenceFingerprint(), validation.outcome().name(),
                        validation.fieldResults().stream().map(ReferenceFieldResultResponse::from).toList(),
                        validation.checkedAt(), validation.correlationId()),
                snapshot == null ? null : new PricingSnapshotResponse(snapshot.pricingRequestId(),
                        snapshot.pricingQuoteId(), snapshot.status(), snapshot.quotedAmounts(), snapshot.receivedAt(),
                        snapshot.correlationId(), snapshot.typed(), snapshot.legacy()),
                history,
                booking.attributes().getOrDefault(
                        "pricingStatus", snapshot == null ? "UNPRICED" : snapshot.typed() == null
                                ? "LEGACY_PRICED"
                                : "PRICED"),
                booking.confirmationPricingEligible(),
                booking.exceptions().stream().map(this::toException).toList(),
                booking.dndTriggerCandidates().stream().map(this::toDndCandidate).toList(),
                booking.lifecycleEvents().stream().map(this::toLifecycle).toList(),
                movementStatuses.stream().map(this::toMovementStatus).toList(),
                booking.attributes());
    }

    private static HttpStatus pricingStatus(PricingCommandResult result) {
        return switch (result.outcome()) {
            case PRICED, LEGACY_PRICED -> HttpStatus.OK;
            case MANUAL_PRICING_REQUIRED, VALIDATION_FAILED -> HttpStatus.UNPROCESSABLE_ENTITY;
            case DENIED -> HttpStatus.FORBIDDEN;
            case CONFLICT, IN_PROGRESS, BOOKING_CHANGED -> HttpStatus.CONFLICT;
            case TIMEOUT -> HttpStatus.GATEWAY_TIMEOUT;
            case UNAVAILABLE, CIRCUIT_OPEN -> HttpStatus.SERVICE_UNAVAILABLE;
            case MALFORMED -> HttpStatus.BAD_GATEWAY;
        };
    }

    private MovementStatusProjectionResponse toMovementStatus(MovementStatusProjection projection) {
        MovementLocation location = projection.location();
        return new MovementStatusProjectionResponse(
                projection.bookingRef(),
                projection.containerRef(),
                projection.movementId(),
                projection.moveCode(),
                projection.eventClassifierCode(),
                projection.occurredDateTime(),
                projection.receivedDateTime(),
                projection.derivedStatus(),
                projection.emptyIndicatorCode(),
                projection.transshipment(),
                location == null ? null : new MovementLocationResponse(location.unLocationCode(),
                        location.facilityCode(), location.facilityTypeCode()),
                projection.eventId(),
                projection.source(),
                projection.eventTime(),
                projection.dataSchemaVersion(),
                projection.correlationId(),
                projection.projectedAt());
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
        return required(actorSubjectId, "X-LinerCore-Actor-Id header is required");
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
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error("BOOKING_VALIDATION", exception.getMessage(), validationFields(exception.getMessage())));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiErrorResponse> forbidden(SecurityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error("forbidden", exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> conflict(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error("conflict", exception.getMessage()));
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ApiErrorResponse> idempotencyConflict(IdempotencyConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error("IDEMPOTENCY_CONFLICT", exception.getMessage()));
    }

    @ExceptionHandler(CommandInProgressException.class)
    public ResponseEntity<ApiErrorResponse> commandInProgress(CommandInProgressException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error("COMMAND_IN_PROGRESS", exception.getMessage()));
    }

    @ExceptionHandler(BookingChangedException.class)
    public ResponseEntity<ApiErrorResponse> bookingChanged(BookingChangedException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error("BOOKING_CHANGED", exception.getMessage()));
    }

    @ExceptionHandler(ReferenceProviderUnavailable.class)
    public ResponseEntity<ApiErrorResponse> referenceUnavailable(ReferenceProviderUnavailable exception) {
        ResponseEntity.BodyBuilder response = ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE);
        if (exception.retryAfter() != null) {
            response.header("Retry-After", String.valueOf(Math.max(1, exception.retryAfter().toSeconds())));
        }
        return response.body(new ApiErrorResponse("REFERENCE_DATA_UNAVAILABLE", exception.getMessage(), List.of(),
                exception.correlationId()));
    }

    private ApiErrorResponse error(String code, String message) {
        return error(code, message, List.of());
    }

    private ApiErrorResponse error(String code, String message, List<String> fields) {
        return new ApiErrorResponse(code, message == null ? code : message, fields, "local-correlation");
    }

    private List<String> validationFields(String message) {
        if (message == null) {
            return List.of();
        }
        String normalized = message.toLowerCase();
        if (normalized.contains("customer id")) {
            return List.of("customerId");
        }
        if (normalized.contains("exactly one routing")) {
            return List.of("routing");
        }
        if (normalized.contains("leg sequence")) {
            return List.of("routing[0].legSequence");
        }
        if (normalized.contains("load and discharge") || normalized.contains("discharge un/locode")) {
            return List.of("routing[0].dischargeUnLocode");
        }
        if (normalized.contains("load un/locode")) {
            return List.of("routing[0].loadUnLocode");
        }
        if (normalized.contains("voyage id")) {
            return List.of("routing[0].voyageId");
        }
        if (normalized.contains("exactly one equipment")) {
            return List.of("equipment");
        }
        if (normalized.contains("equipment type")) {
            return List.of("equipment[0].equipmentTypeCode");
        }
        if (normalized.contains("quantity")) {
            return List.of("equipment[0].quantity");
        }
        if (normalized.contains("equipment id")) {
            return List.of("equipment[0].equipmentId");
        }
        if (normalized.contains("usd fcl dry")) {
            return List.of("currency", "cargoMode", "reefer", "dangerousGoods");
        }
        if (normalized.contains("currency")) {
            return List.of("currency");
        }
        if (normalized.contains("cargo mode")) {
            return List.of("cargoMode");
        }
        return List.of();
    }

    public record CreateBookingRequest(
            String customerId,
            List<RoutingLegRequest> routing,
            List<EquipmentAssignmentRequest> equipment,
            String currency,
            String cargoMode,
            boolean reefer,
            boolean dangerousGoods,
            Map<String, String> attributes) {

        public CreateBookingRequest {
            routing = List.copyOf(routing == null ? List.of() : routing);
            equipment = List.copyOf(equipment == null ? List.of() : equipment);
            attributes = Map.copyOf(attributes == null ? Map.of() : attributes);
        }
    }

    public record RoutingLegRequest(
            int legSequence,
            String loadUnLocode,
            String dischargeUnLocode,
            String voyageId) {
        RoutingLeg toDomain() {
            return new RoutingLeg(legSequence, loadUnLocode, dischargeUnLocode, voyageId);
        }
    }

    public record EquipmentAssignmentRequest(
            String equipmentTypeCode,
            int quantity,
            String equipmentId) {
        EquipmentAssignment toDomain() {
            return new EquipmentAssignment(equipmentTypeCode, quantity, equipmentId);
        }
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

    public record BookingResponse(
            String id,
            String bookingNumber,
            int revision,
            BookingStatus status,
            String customerId,
            List<RoutingLegResponse> routing,
            List<EquipmentAssignmentResponse> equipment,
            String currency,
            String cargoMode,
            boolean reefer,
            boolean dangerousGoods,
            boolean legacyIncomplete,
            ReferenceValidationResponse referenceValidation,
            PricingSnapshotResponse pricingSnapshot,
            PricingHistoryPage pricingHistory,
            String pricingStatus,
            boolean confirmationEligible,
            List<BookingExceptionResponse> exceptions,
            List<DndTriggerCandidateResponse> dndTriggerCandidates,
            List<LifecycleEventResponse> lifecycleEvents,
            List<MovementStatusProjectionResponse> movementStatuses,
            Map<String, String> attributes) {
    }

    public record BookingListResponse(List<BookingResponse> items, int returned, int page, int size) {
    }

    public record RoutingLegResponse(
            int legSequence,
            String loadUnLocode,
            String dischargeUnLocode,
            String voyageId) {
        static RoutingLegResponse from(RoutingLeg leg) {
            return new RoutingLegResponse(leg.legSequence(), leg.loadUnLocode(), leg.dischargeUnLocode(),
                    leg.voyageId());
        }
    }

    public record EquipmentAssignmentResponse(String equipmentTypeCode, int quantity, String equipmentId) {
        static EquipmentAssignmentResponse from(EquipmentAssignment item) {
            return new EquipmentAssignmentResponse(item.equipmentTypeCode(), item.quantity(), item.equipmentId());
        }
    }

    public record PricingSnapshotResponse(
            String pricingRequestId,
            String pricingQuoteId,
            String status,
            Map<String, String> quotedAmounts,
            Instant quotedAt,
            String correlationId,
            com.linercore.platform.booking.domain.model.BookingPricingSnapshot typed,
            com.linercore.platform.booking.domain.model.LegacyPricingSnapshot legacy) {
    }

    public record PricingCommandResponse(
            PricingCommandResult result,
            PricingHistoryPage history,
            boolean confirmationEligible) {
    }

    public record ReferenceValidationResponse(
            int bookingRevision,
            String referenceFingerprint,
            String outcome,
            List<ReferenceFieldResultResponse> fieldResults,
            Instant checkedAt,
            String correlationId) {
    }

    public record ReferenceFieldResultResponse(
            String fieldPath,
            String referenceSet,
            String requestedValue,
            String outcome,
            String recordId,
            String recordCode,
            Long recordVersion,
            String reasonCode) {
        static ReferenceFieldResultResponse from(ReferenceFieldResult result) {
            return new ReferenceFieldResultResponse(result.fieldPath(), result.referenceSet(), result.requestedValue(),
                    result.outcome().name(), result.recordId(), result.recordCode(), result.recordVersion(),
                    result.reasonCode());
        }
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

    public record MovementStatusProjectionResponse(
            String bookingRef,
            String containerRef,
            String movementId,
            String moveCode,
            String eventClassifierCode,
            Instant occurredDateTime,
            Instant receivedDateTime,
            String derivedStatus,
            String emptyIndicatorCode,
            boolean transshipment,
            MovementLocationResponse location,
            String eventId,
            String source,
            Instant eventTime,
            int dataSchemaVersion,
            String correlationId,
            Instant projectedAt) {
    }

    public record MovementLocationResponse(
            String unLocationCode,
            String facilityCode,
            String facilityTypeCode) {
    }

    public record ApiErrorResponse(String code, String message, List<String> fields, String correlationId) {
    }
}
