package com.linercore.platform.containermovement.container.api;

import com.linercore.platform.containermovement.applicationservice.ContainerMovementApplicationService;
import com.linercore.platform.containermovement.applicationservice.command.CaptureMovementCommand;
import com.linercore.platform.containermovement.applicationservice.command.CreateJourneyCommand;
import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.ExpectedMovement;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import com.linercore.platform.containermovement.domain.model.MovementEventType;
import com.linercore.platform.containermovement.domain.model.MovementStatus;
import java.time.Instant;
import java.util.List;
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
@RequestMapping("/api/container-movement")
public class ContainerMovementApiController {
    private final ContainerMovementApplicationService service;

    public ContainerMovementApiController(ContainerMovementApplicationService service) {
        this.service = service;
    }

    @GetMapping("/journeys")
    public JourneyListResponse recent(
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestParam(name = "limit", defaultValue = "25") int limit,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        List<JourneyResponse> items = service.recent(actor, correlation(correlationId, null), limit).stream()
                .map(this::toResponse)
                .toList();
        return new JourneyListResponse(items, items.size());
    }

    @PostMapping("/journeys")
    public ResponseEntity<JourneyResponse> createJourney(
            @RequestBody CreateJourneyRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        ContainerJourney journey = service.createJourney(new CreateJourneyCommand(
                request.bookingId(),
                request.containerId(),
                request.routeLocationIds(),
                actor(request.actorSubjectId()),
                request.idempotencyKey(),
                correlation(correlationId, request.correlationId())));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(journey));
    }

    @GetMapping("/journeys/{id}")
    public JourneyResponse detail(
            @PathVariable("id") String id,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.detail(id, actor, correlation(correlationId, null)));
    }

    @GetMapping("/bookings/{bookingId}/journey")
    public JourneyResponse detailByBooking(
            @PathVariable("bookingId") String bookingId,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.detailByBookingId(bookingId, actor, correlation(correlationId, null)));
    }

    @PostMapping("/journeys/{id}/movements")
    public JourneyResponse captureMovement(
            @PathVariable("id") String id,
            @RequestBody CaptureMovementRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        String resolvedCorrelation = correlation(correlationId, request.correlationId());
        ContainerJourney journey = service.captureMovement(new CaptureMovementCommand(
                id,
                request.eventType(),
                request.containerId(),
                request.locationId(),
                request.eventTime(),
                actor(request.actorSubjectId()),
                request.idempotencyKey(),
                resolvedCorrelation));
        return toResponse(journey);
    }

    private JourneyResponse toResponse(ContainerJourney journey) {
        return new JourneyResponse(
                journey.id().value(),
                journey.bookingId(),
                journey.bookingRevision(),
                journey.containerId(),
                journey.status(),
                journey.expectedMovements().stream().map(this::toExpected).toList(),
                journey.history().stream().map(this::toEvent).toList(),
                journey.updatedAt());
    }

    private ExpectedMovementResponse toExpected(ExpectedMovement movement) {
        return new ExpectedMovementResponse(movement.sequence(), movement.expectedEventType(), movement.locationId());
    }

    private MovementEventResponse toEvent(MovementEvent event) {
        return new MovementEventResponse(event.eventId(), event.eventType(), event.containerId(), event.locationId(),
                event.eventTime(), event.dedupeKey().value(), event.correlationId());
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

    public record CreateJourneyRequest(
            String bookingId,
            String containerId,
            List<String> routeLocationIds,
            String actorSubjectId,
            String idempotencyKey,
            String correlationId) {
    }

    public record CaptureMovementRequest(
            MovementEventType eventType,
            String containerId,
            String locationId,
            Instant eventTime,
            String actorSubjectId,
            String idempotencyKey,
            String correlationId) {
    }

    public record JourneyResponse(
            String id,
            String bookingId,
            int bookingRevision,
            String containerId,
            MovementStatus status,
            List<ExpectedMovementResponse> expectedMovements,
            List<MovementEventResponse> history,
            Instant updatedAt) {
    }

    public record JourneyListResponse(List<JourneyResponse> items, int returned) {
    }

    public record ExpectedMovementResponse(String sequence, MovementEventType expectedEventType, String locationId) {
    }

    public record MovementEventResponse(
            String eventId,
            MovementEventType eventType,
            String containerId,
            String locationId,
            Instant eventTime,
            String dedupeKey,
            String correlationId) {
    }

    public record ApiErrorResponse(String code, String message, List<String> fields, String correlationId) {
    }
}
