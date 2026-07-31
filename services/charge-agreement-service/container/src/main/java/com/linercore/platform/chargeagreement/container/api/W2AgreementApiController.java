package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationException;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementCommands;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementViews;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFilter;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/charge-agreements")
public final class W2AgreementApiController {
    public static final String MEDIA_TYPE =
            "application/vnd.linercore.charge-agreement-v2+json";
    private static final String VENDOR_ACCEPT = "Accept=" + MEDIA_TYPE;

    private final AgreementApplicationService service;

    public W2AgreementApiController(AgreementApplicationService service) {
        this.service = service;
    }

    @GetMapping(headers = VENDOR_ACCEPT, produces = MEDIA_TYPE)
    public PageResponse search(
            @RequestParam(name = "customerId", required = false) String customerId,
            @RequestParam(name = "tradeLaneId", required = false) String tradeLaneId,
            @RequestParam(name = "lifecycle", required = false) AgreementLifecycle lifecycle,
            @RequestParam(name = "validOn", required = false) LocalDate validOn,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return page(service.search(new AgreementSearchQuery(
                customerId, tradeLaneId, lifecycle, validOn, page, size,
                subject(request), correlation(correlationId))));
    }

    @PostMapping(
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public ResponseEntity<DetailResponse> create(
            @RequestBody CreateRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        String correlation = correlation(correlationId);
        AgreementViews.Detail created = service.create(new AgreementCommands.Create(
                body.agreementNumber(), command(body.commercial()), body.reason(),
                subject(request), correlation));
        return ResponseEntity.status(201).body(detail(created));
    }

    @GetMapping(path = "/{agreementId}", headers = VENDOR_ACCEPT, produces = MEDIA_TYPE)
    public DetailResponse detail(
            @PathVariable("agreementId") String agreementId,
            @RequestParam(name = "agreementVersionId", required = false) String agreementVersionId,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return detail(service.detail(
                agreementId, agreementVersionId, subject(request), correlation(correlationId)));
    }

    @PutMapping(
            path = "/{agreementId}",
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public DetailResponse update(
            @PathVariable("agreementId") String agreementId,
            @RequestBody UpdateRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return detail(service.updateDraft(new AgreementCommands.UpdateDraft(
                agreementId, body.agreementVersionId(), body.expectedRowVersion(),
                command(body.commercial()), body.reason(), subject(request), correlation(correlationId))));
    }

    @PostMapping(
            path = "/{agreementId}/versions",
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public ResponseEntity<DetailResponse> successor(
            @PathVariable("agreementId") String agreementId,
            @RequestBody SuccessorRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        AgreementViews.Detail created = service.createSuccessor(new AgreementCommands.CreateSuccessor(
                agreementId, body.sourceAgreementVersionId(), command(body.commercial()),
                body.reason(), subject(request), correlation(correlationId)));
        return ResponseEntity.status(201).body(detail(created));
    }

    @PostMapping(
            path = "/{agreementId}/versions/{agreementVersionId}/approve",
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public DetailResponse approve(
            @PathVariable("agreementId") String agreementId,
            @PathVariable("agreementVersionId") String agreementVersionId,
            @RequestBody ActionRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return detail(service.approve(new AgreementCommands.Approve(
                agreementId, agreementVersionId, body.expectedRowVersion(),
                body.reason(), subject(request), correlation(correlationId))));
    }

    @PostMapping(
            path = "/{agreementId}/suspend",
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public DetailResponse suspend(
            @PathVariable("agreementId") String agreementId,
            @RequestBody VersionActionRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return detail(service.suspend(new AgreementCommands.Transition(
                agreementId, body.agreementVersionId(), body.expectedRowVersion(),
                body.reason(), subject(request), correlation(correlationId))));
    }

    @PostMapping(
            path = "/{agreementId}/expire",
            headers = VENDOR_ACCEPT,
            consumes = MEDIA_TYPE,
            produces = MEDIA_TYPE)
    public DetailResponse expire(
            @PathVariable("agreementId") String agreementId,
            @RequestBody VersionActionRequest body,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            HttpServletRequest request) {
        return detail(service.expire(new AgreementCommands.Transition(
                agreementId, body.agreementVersionId(), body.expectedRowVersion(),
                body.reason(), subject(request), correlation(correlationId))));
    }

    @ExceptionHandler(AgreementApplicationException.class)
    public ResponseEntity<ErrorResponse> applicationFailure(
            AgreementApplicationException exception, HttpServletRequest request) {
        String correlationId = correlation(request.getHeader("X-Correlation-Id"));
        return ResponseEntity.status(exception.status()).body(new ErrorResponse(
                exception.code(), exception.getMessage(),
                exception.fieldErrors().stream()
                        .map(value -> new FieldErrorResponse(value.field(), value.reason()))
                        .toList(),
                correlationId));
    }

    private static AgreementCommands.Commercial command(CommercialRequest value) {
        if (value == null) {
            return null;
        }
        return new AgreementCommands.Commercial(
                value.customerId(), value.tradeLaneId(), value.originLocationId(),
                value.destinationLocationId(), value.equipmentTypeId(),
                value.validFrom(), value.validTo(), value.baseRateVersionId(),
                value.surchargeRateVersionId(), value.localRateVersionId());
    }

    private static PageResponse page(AgreementViews.Page value) {
        return new PageResponse(
                value.items().stream().map(W2AgreementApiController::summary).toList(),
                value.page(), value.size(), value.total(), value.hasMore(), value.canCreate());
    }

    private static SummaryResponse summary(AgreementViews.ListItem value) {
        return new SummaryResponse(
                value.agreementId(), value.agreementNumber(), value.authorityModel().name(),
                version(value.selectedVersion()), version(value.approvedVersion()),
                value.hasDraft(), value.w2AuthorityEligible(), value.readOnly());
    }

    private static DetailResponse detail(AgreementViews.Detail value) {
        return new DetailResponse(
                value.agreement().id().value(),
                value.agreement().number().value(),
                value.agreement().authorityModel().name(),
                version(value.selectedVersion()),
                version(value.approvedVersion()),
                value.agreement().versions().stream().map(W2AgreementApiController::version).toList(),
                value.activity().stream().map(W2AgreementApiController::activity).toList(),
                new CapabilitiesResponse(
                        value.capabilities().canCreate(), value.capabilities().canUpdate(),
                        value.capabilities().canApprove(), value.capabilities().canCreateSuccessor(),
                        value.capabilities().canSuspend(), value.capabilities().canExpire()),
                value.w2AuthorityEligible(),
                value.readOnly());
    }

    private static VersionResponse version(AgreementVersion value) {
        if (value == null) {
            return null;
        }
        return new VersionResponse(
                value.id().value(), value.versionNo(), value.lifecycle().name(), value.rowVersion(),
                value.sourceVersionId() == null ? null : value.sourceVersionId().value(),
                value.customerId().value(), value.tradeLaneId().value(),
                value.originLocationId() == null ? null : value.originLocationId().value(),
                value.destinationLocationId() == null ? null : value.destinationLocationId().value(),
                value.equipmentTypeId() == null ? null : value.equipmentTypeId().value(),
                value.commodityId() == null ? null : value.commodityId().value(),
                value.validity().validFrom(), value.validity().validTo(),
                value.links().stream().map(W2AgreementApiController::link).toList(),
                value.createdBy(), value.createdAt(), value.updatedBy(), value.updatedAt(),
                value.approvedBy(), value.approvedAt(), value.correlationId());
    }

    private static RateLinkResponse link(AgreementRateLink value) {
        return new RateLinkResponse(value.category().name(), value.rateVersionId().value());
    }

    private static ActivityResponse activity(AgreementActivity value) {
        return new ActivityResponse(
                value.activityId(), value.agreementVersionId().value(), value.action().name(),
                value.actorSubjectId(), value.occurredAt(), value.correlationId(),
                value.reason(), value.resultingRowVersion());
    }

    private static String subject(HttpServletRequest request) {
        Object value = request.getAttribute(ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE);
        return value instanceof String subject ? subject : null;
    }

    private static String correlation(String value) {
        return value == null || value.isBlank() ? UUID.randomUUID().toString() : value;
    }

    public record CommercialRequest(
            String customerId,
            String tradeLaneId,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            LocalDate validFrom,
            LocalDate validTo,
            String baseRateVersionId,
            String surchargeRateVersionId,
            String localRateVersionId) {
    }

    public record CreateRequest(String agreementNumber, CommercialRequest commercial, String reason) {
    }

    public record UpdateRequest(
            String agreementVersionId,
            long expectedRowVersion,
            CommercialRequest commercial,
            String reason) {
    }

    public record SuccessorRequest(
            String sourceAgreementVersionId,
            CommercialRequest commercial,
            String reason) {
    }

    public record ActionRequest(long expectedRowVersion, String reason) {
    }

    public record VersionActionRequest(
            String agreementVersionId, long expectedRowVersion, String reason) {
    }

    public record RateLinkResponse(String category, String rateVersionId) {
    }

    public record VersionResponse(
            String agreementVersionId,
            long versionNo,
            String lifecycle,
            long rowVersion,
            String sourceAgreementVersionId,
            String customerId,
            String tradeLaneId,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            String commodityId,
            LocalDate validFrom,
            LocalDate validTo,
            List<RateLinkResponse> rateLinks,
            String createdBy,
            Instant createdAt,
            String updatedBy,
            Instant updatedAt,
            String approvedBy,
            Instant approvedAt,
            String correlationId) {
    }

    public record SummaryResponse(
            String agreementId,
            String agreementNumber,
            String authorityModel,
            VersionResponse selectedVersion,
            VersionResponse approvedVersion,
            boolean hasDraft,
            boolean w2AuthorityEligible,
            boolean readOnly) {
    }

    public record DetailResponse(
            String agreementId,
            String agreementNumber,
            String authorityModel,
            VersionResponse selectedVersion,
            VersionResponse approvedVersion,
            List<VersionResponse> versions,
            List<ActivityResponse> activity,
            CapabilitiesResponse capabilities,
            boolean w2AuthorityEligible,
            boolean readOnly) {
    }

    public record PageResponse(
            List<SummaryResponse> items,
            int page,
            int size,
            long total,
            boolean hasMore,
            boolean canCreate) {
    }

    public record ActivityResponse(
            String activityId,
            String agreementVersionId,
            String action,
            String actorSubjectId,
            Instant occurredAt,
            String correlationId,
            String reason,
            long resultingRowVersion) {
    }

    public record CapabilitiesResponse(
            boolean canCreate,
            boolean canUpdate,
            boolean canApprove,
            boolean canCreateSuccessor,
            boolean canSuspend,
            boolean canExpire) {
    }

    public record FieldErrorResponse(String field, String reason) {
    }

    public record ErrorResponse(
            String code,
            String message,
            List<FieldErrorResponse> fields,
            String correlationId) {
    }
}
