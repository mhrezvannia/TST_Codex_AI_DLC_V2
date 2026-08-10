package com.linercore.platform.referencedata.container.api;

import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.applicationservice.command.ReferenceMutationCommand;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.applicationservice.query.PublishBatchResult;
import com.linercore.platform.referencedata.applicationservice.query.ReferencePage;
import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
import com.linercore.platform.referencedata.domain.validation.ValidationResult;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reference-sets")
public class ReferenceDataController {
    private final ReferenceDataApplicationService service;

    public ReferenceDataController(ReferenceDataApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ReferenceSet[]> sets() {
        return ResponseEntity.ok(ReferenceSet.values());
    }

    @GetMapping("/{set}/records")
    public ResponseEntity<ReferencePage> list(
            @PathVariable("set") ReferenceSet set,
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size) {
        return ResponseEntity.ok(service.list(set, includeInactive, page, size));
    }

    @GetMapping("/{set}/records/{id}")
    public ResponseEntity<ReferenceRecord> detail(@PathVariable("set") ReferenceSet set, @PathVariable("id") String id) {
        return ResponseEntity.ok(service.detail(set, new ReferenceId(id)));
    }

    @PostMapping("/{set}/records")
    public ResponseEntity<ReferenceRecord> create(
            @PathVariable("set") ReferenceSet set,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody ReferenceMutationCommand request) {
        return ResponseEntity.ok(service.create(withSetAndCorrelation(request, set, correlationId)));
    }

    @PutMapping("/{set}/records/{id}")
    public ResponseEntity<ReferenceRecord> update(
            @PathVariable("set") ReferenceSet set,
            @PathVariable("id") String id,
            @RequestParam(name = "version") long version,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody ReferenceMutationCommand request) {
        return ResponseEntity.ok(service.update(new ReferenceId(id), version, withSetAndCorrelation(request, set, correlationId)));
    }

    @PostMapping("/{set}/records/{id}/deactivate")
    public ResponseEntity<ReferenceRecord> deactivate(
            @PathVariable("set") ReferenceSet set,
            @PathVariable("id") String id,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody ReferenceStatusRequest request) {
        return ResponseEntity.ok(service.deactivate(set, new ReferenceId(id), request.reason(),
                request.actorSubjectId(), correlationId == null ? request.correlationId() : correlationId));
    }

    @PostMapping("/{set}/records/{id}/reactivate")
    public ResponseEntity<ReferenceRecord> reactivate(
            @PathVariable("set") ReferenceSet set,
            @PathVariable("id") String id,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody ReferenceStatusRequest request) {
        return ResponseEntity.ok(service.reactivate(set, new ReferenceId(id), request.reason(),
                request.actorSubjectId(), correlationId == null ? request.correlationId() : correlationId));
    }

    @PostMapping("/{set}/records/validate")
    public ResponseEntity<ValidationResult> validate(
            @PathVariable("set") ReferenceSet set,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody ReferenceMutationCommand request) {
        return ResponseEntity.ok(service.validateOnly(withSetAndCorrelation(request, set, correlationId)));
    }

    @GetMapping("/{set}/records/{id}/history")
    public ResponseEntity<List<ReferenceChange>> history(@PathVariable("set") ReferenceSet set, @PathVariable("id") String id) {
        return ResponseEntity.ok(service.history(set, new ReferenceId(id)));
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventPublicationStatusView>> eventStatuses(
            @RequestParam(name = "eventId", required = false) String eventId,
            @RequestParam(name = "recordId", required = false) String recordId,
            @RequestParam(name = "referenceSet", required = false) ReferenceSet referenceSet,
            @RequestParam(name = "status", required = false) OutboxStatus status,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to,
            @RequestParam(name = "limit", defaultValue = "100") int limit) {
        return ResponseEntity.ok(service.outboxStatuses(new OutboxStatusQuery(eventId, recordId, referenceSet, status, from, to, limit)));
    }

    @PostMapping("/events/claims")
    public ResponseEntity<List<OutboxEvent>> claimEvents(
            @RequestParam(name = "workerId") String workerId,
            @RequestParam(name = "batchSize", defaultValue = "25") int batchSize) {
        return ResponseEntity.ok(service.claimOutboxBatch(workerId, batchSize));
    }

    @PostMapping("/events/publish")
    public ResponseEntity<PublishBatchResult> publishEvents(
            @RequestParam(name = "workerId") String workerId,
            @RequestParam(name = "batchSize", defaultValue = "25") int batchSize) {
        return ResponseEntity.ok(service.publishOutboxBatch(workerId, batchSize));
    }

    private ReferenceMutationCommand withSetAndCorrelation(ReferenceMutationCommand request, ReferenceSet set, String correlationId) {
        return new ReferenceMutationCommand(set, request.code(), request.displayName(), request.attributes(),
                request.actorSubjectId(), request.actorDisplayName(), request.operation(), request.reason(),
                correlationId == null ? request.correlationId() : correlationId);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> notFound(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("not_found", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("bad_request", exception.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> forbidden(SecurityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("forbidden", exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> conflict(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("conflict", exception.getMessage()));
    }

    public record ErrorResponse(String code, String message) {
    }

    public record ReferenceStatusRequest(
            String reason,
            String actorSubjectId,
            String correlationId) {
    }
}
