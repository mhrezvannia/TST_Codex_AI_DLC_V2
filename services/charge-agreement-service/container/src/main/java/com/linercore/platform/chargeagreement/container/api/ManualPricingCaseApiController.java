package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.pricing.ManualPricingCaseQueryService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.ManualPricingCaseQueryService.ManualPricingCaseNotFoundException;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFilter;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public final class ManualPricingCaseApiController {
    private static final Set<String> ALLOWED_QUERY_KEYS = Set.of(
            "status", "reasonCode", "bookingRef", "openedFrom", "openedTo", "page", "size");

    private final ManualPricingCaseQueryService service;

    public ManualPricingCaseApiController(ManualPricingCaseQueryService service) {
        this.service = service;
    }

    @GetMapping(path = "/api/manual-pricing-cases", produces = "application/json")
    public ManualCasePageResponse list(
            @RequestAttribute(ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE) String subjectId,
            @RequestHeader("X-Correlation-Id") String correlationId,
            @RequestParam(name = "status", defaultValue = "OPEN") String status,
            @RequestParam(name = "reasonCode", required = false) String reasonCode,
            @RequestParam(name = "bookingRef", required = false) String bookingRef,
            @RequestParam(name = "openedFrom", required = false) String openedFrom,
            @RequestParam(name = "openedTo", required = false) String openedTo,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            HttpServletRequest request) {
        rejectUnknownQueryKeys(request);
        if (!ManualPricingCase.OPEN.equals(status)) {
            throw new IllegalArgumentException("status must be OPEN");
        }
        ManualPricingCaseRepository.ManualCasePage result = service.list(
                subjectId,
                correlationId,
                new ManualPricingCaseRepository.ManualCaseQuery(
                        blankToNull(reasonCode),
                        blankToNull(bookingRef),
                        instant(openedFrom, "openedFrom"),
                        instant(openedTo, "openedTo"),
                        page,
                        size));
        return new ManualCasePageResponse(
                result.items().stream().map(ManualPricingCaseApiController::response).toList(),
                result.total(),
                result.page(),
                result.size());
    }

    @GetMapping(path = "/api/manual-pricing-cases/{caseId}", produces = "application/json")
    public ManualCaseResponse detail(
            @RequestAttribute(ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE) String subjectId,
            @RequestHeader("X-Correlation-Id") String correlationId,
            @PathVariable String caseId) {
        return response(service.detail(subjectId, correlationId, caseId));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> badRequest(IllegalArgumentException exception, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(error(
                "MANUAL_CASE_BAD_REQUEST", exception.getMessage(), request));
    }

    @ExceptionHandler(SecurityException.class)
    ResponseEntity<ApiError> forbidden(SecurityException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error(
                "MANUAL_CASE_FORBIDDEN", "Manual pricing case access denied", request));
    }

    @ExceptionHandler(ManualPricingCaseNotFoundException.class)
    ResponseEntity<ApiError> notFound(ManualPricingCaseNotFoundException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(
                "MANUAL_CASE_NOT_FOUND", exception.getMessage(), request));
    }

    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<ApiError> unavailable(RuntimeException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error(
                "MANUAL_CASE_UNAVAILABLE", "Manual pricing evidence is unavailable", request));
    }

    private static ManualCaseResponse response(ManualPricingCase value) {
        return new ManualCaseResponse(
                value.caseId(),
                value.pricingRequestId(),
                value.reasonCode(),
                value.status(),
                value.bookingRef(),
                value.amendmentSeq(),
                value.requestHash(),
                value.correlationId(),
                value.openedAt(),
                value.requestContext(),
                value.legacyEvidence());
    }

    private static void rejectUnknownQueryKeys(HttpServletRequest request) {
        List<String> unknown = request.getParameterMap().keySet().stream()
                .filter(key -> !ALLOWED_QUERY_KEYS.contains(key))
                .sorted()
                .toList();
        if (!unknown.isEmpty()) {
            throw new IllegalArgumentException("unsupported query parameter");
        }
    }

    private static Instant instant(String value, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException(field + " must be a UTC instant");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static ApiError error(String code, String message, HttpServletRequest request) {
        String correlation = request.getHeader("X-Correlation-Id");
        return new ApiError(code, message, correlation == null ? "rejected" : correlation);
    }

    public record ManualCasePageResponse(
            List<ManualCaseResponse> items,
            long total,
            int page,
            int size) {
    }

    public record ManualCaseResponse(
            String caseId,
            String pricingRequestId,
            String reasonCode,
            String status,
            String bookingRef,
            Integer amendmentSeq,
            String requestHash,
            String correlationId,
            Instant openedAt,
            ManualPricingCase.RequestContext requestContext,
            boolean legacyEvidence) {
    }

    public record ApiError(String code, String message, String correlationId) {
    }
}
