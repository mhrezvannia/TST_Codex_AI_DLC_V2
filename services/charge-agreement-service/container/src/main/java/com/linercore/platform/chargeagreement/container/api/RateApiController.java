package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.rate.RateApplicationException;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateCommands;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateSearchQuery;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateViews;
import com.linercore.platform.chargeagreement.container.RateServiceIdentityFilter;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
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
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/charge-rates")
public final class RateApiController {
    private final RateApplicationService service;

    public RateApiController(RateApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public RatePageResponse search(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "category", required = false) RateCategory category,
            @RequestParam(name = "lifecycle", required = false) RatePresentationState lifecycle,
            @RequestParam(name = "asOf", required = false) LocalDate asOf,
            @RequestParam(name = "originId", required = false) String originId,
            @RequestParam(name = "destinationId", required = false) String destinationId,
            @RequestParam(name = "equipmentTypeId", required = false) String equipmentTypeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        RateViews.Page result = service.search(new RateSearchQuery(category, lifecycle, asOf, originId, destinationId,
                equipmentTypeId, query, page, size, subjectId, correlation(correlationId)));
        return new RatePageResponse(result.items().stream().map(this::toListItem).toList(),
                result.page(), result.size(), result.total(), result.hasMore(), result.canCreate(),
                result.evaluatedAsOf());
    }

    @PostMapping
    public ResponseEntity<RateDetailResponse> create(
            @RequestBody RateCreateRequest request,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        RateViews.Detail result = service.create(new RateCommands.Create(request.category(), request.chargeCodeId(),
                request.chargeCode(), request.unitRate(), request.currencyId(), request.currency(),
                request.effectiveFrom(), request.effectiveTo(), request.originLocationId(),
                request.destinationLocationId(), request.equipmentTypeId(), subjectId, correlation(correlationId)));
        return ResponseEntity.created(URI.create("/api/charge-rates/" + result.rate().id().value()))
                .body(toDetail(result));
    }

    @GetMapping("/{rateId}")
    public RateDetailResponse detail(
            @PathVariable("rateId") String rateId,
            @RequestParam(name = "asOf", required = false) LocalDate asOf,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toDetail(service.detail(rateId, asOf, subjectId, correlation(correlationId)));
    }

    @GetMapping("/{rateId}/history")
    public List<RateVersionResponse> history(
            @PathVariable("rateId") String rateId,
            @RequestParam(name = "asOf", required = false) LocalDate asOf,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toDetail(service.detail(rateId, asOf, subjectId, correlation(correlationId))).versions();
    }

    @PutMapping("/{rateId}/versions/{versionId}")
    public RateDetailResponse updateDraft(
            @PathVariable("rateId") String rateId,
            @PathVariable("versionId") String versionId,
            @RequestBody RateUpdateRequest request,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toDetail(service.updateDraft(new RateCommands.UpdateDraft(rateId, versionId,
                request.expectedRowVersion(), request.unitRate(), request.currencyId(), request.currency(),
                request.effectiveFrom(), request.effectiveTo(), request.originLocationId(),
                request.destinationLocationId(), request.equipmentTypeId(), subjectId, correlation(correlationId))));
    }

    @PostMapping("/{rateId}/versions/{versionId}/approve")
    public RateDetailResponse approve(
            @PathVariable("rateId") String rateId,
            @PathVariable("versionId") String versionId,
            @RequestBody ExpectedVersionRequest request,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toDetail(service.approve(new RateCommands.Approve(rateId, versionId, request.expectedRowVersion(),
                subjectId, correlation(correlationId))));
    }

    @PostMapping("/{rateId}/versions/{versionId}/successor")
    public ResponseEntity<RateDetailResponse> createSuccessor(
            @PathVariable("rateId") String rateId,
            @PathVariable("versionId") String versionId,
            @RequestBody RateSuccessorRequest request,
            @RequestAttribute(name = RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE) String subjectId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        RateViews.Detail result = service.createSuccessor(new RateCommands.CreateSuccessor(rateId, versionId,
                request.unitRate(), request.effectiveFrom(), request.effectiveTo(), request.originLocationId(),
                request.destinationLocationId(), request.equipmentTypeId(), subjectId, correlation(correlationId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDetail(result));
    }

    @ExceptionHandler(RateApplicationException.class)
    public ResponseEntity<ApiErrorResponse> rateFailure(RateApplicationException exception) {
        return ResponseEntity.status(exception.status()).body(new ApiErrorResponse(exception.code(),
                exception.getMessage(), exception.fieldErrors().stream()
                        .map(value -> new ApiFieldError(value.field(), value.reason())).toList()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> malformed(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(new ApiErrorResponse("RATE_REQUEST_INVALID", "Rate request is invalid", List.of()));
    }

    private RateDetailResponse toDetail(RateViews.Detail detail) {
        return new RateDetailResponse(detail.rate().id().value(), detail.rate().category(),
                detail.rate().chargeCodeId().value(), detail.rate().chargeCode(),
                detail.versions().stream().map(this::toVersion).toList(),
                detail.activities().stream().map(this::toActivity).toList(),
                detail.actions(), detail.evaluatedAsOf());
    }

    private RateListItemResponse toListItem(RateViews.ListItem item) {
        return new RateListItemResponse(item.rate().id().value(), item.rate().category(),
                item.rate().chargeCodeId().value(), item.rate().chargeCode(),
                toVersion(item.latestVersion()), toVersion(item.selectedSummaryVersion()),
                toVersion(item.effectiveApprovedVersion()), item.hasDraft(), item.versionCount(),
                item.actions(), item.evaluatedAsOf());
    }

    private RateVersionResponse toVersion(RateViews.Version view) {
        if (view == null) {
            return null;
        }
        RateVersion version = view.version();
        return new RateVersionResponse(version.id().value(), version.versionNo(), version.lifecycle(),
                view.presentationState(), version.basis(), version.money().currencyId().value(),
                version.money().currencyCode(), version.money().amount(), version.effectiveFrom(),
                version.effectiveTo(), version.applicability().originLocationId().value(),
                version.applicability().destinationLocationId() == null
                        ? null : version.applicability().destinationLocationId().value(),
                version.applicability().equipmentTypeId().value(), version.rowVersion(),
                version.sourceVersionId() == null ? null : version.sourceVersionId().value(),
                version.createdBy(), version.createdAt(), version.updatedBy(), version.updatedAt(),
                version.approvedBy(), version.approvedAt(), version.correlationId());
    }

    private RateActivityResponse toActivity(RateActivity value) {
        return new RateActivityResponse(value.activityId(), value.versionId().value(), value.versionNo(),
                value.action(), value.actorSubjectId(), value.occurredAt(), value.correlationId(),
                value.reason(), value.resultingRowVersion());
    }

    private static String correlation(String value) {
        return value == null || value.isBlank() ? UUID.randomUUID().toString() : value;
    }

    public record RateCreateRequest(
            RateCategory category,
            String chargeCodeId,
            String chargeCode,
            BigDecimal unitRate,
            String currencyId,
            String currency,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId) {
    }

    public record RateUpdateRequest(
            long expectedRowVersion,
            BigDecimal unitRate,
            String currencyId,
            String currency,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId) {
    }

    public record RateSuccessorRequest(
            BigDecimal unitRate,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId) {
    }

    public record ExpectedVersionRequest(long expectedRowVersion) {
    }

    public record RatePageResponse(
            List<RateListItemResponse> items,
            int page,
            int size,
            long total,
            boolean hasMore,
            boolean canCreate,
            LocalDate evaluatedAsOf) {
    }

    public record RateListItemResponse(
            String rateId,
            RateCategory category,
            String chargeCodeId,
            String chargeCode,
            RateVersionResponse latestVersion,
            RateVersionResponse selectedSummaryVersion,
            RateVersionResponse effectiveApprovedVersion,
            boolean hasDraft,
            int versionCount,
            RateViews.Actions actions,
            LocalDate evaluatedAsOf) {
    }

    public record RateDetailResponse(
            String rateId,
            RateCategory category,
            String chargeCodeId,
            String chargeCode,
            List<RateVersionResponse> versions,
            List<RateActivityResponse> activities,
            RateViews.Actions actions,
            LocalDate evaluatedAsOf) {
    }

    public record RateVersionResponse(
            String versionId,
            long versionNo,
            com.linercore.platform.chargeagreement.domain.rate.RateLifecycle lifecycle,
            RatePresentationState presentationState,
            com.linercore.platform.chargeagreement.domain.rate.RateBasis basis,
            String currencyId,
            String currency,
            BigDecimal unitRate,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            long rowVersion,
            String sourceVersionId,
            String createdBy,
            Instant createdAt,
            String updatedBy,
            Instant updatedAt,
            String approvedBy,
            Instant approvedAt,
            String correlationId) {
    }

    public record RateActivityResponse(
            String activityId,
            String versionId,
            long versionNo,
            RateActivity.Action action,
            String actorSubjectId,
            Instant occurredAt,
            String correlationId,
            String reason,
            long resultingRowVersion) {
    }

    public record ApiErrorResponse(String code, String message, List<ApiFieldError> fields) {
    }

    public record ApiFieldError(String field, String reason) {
    }
}
