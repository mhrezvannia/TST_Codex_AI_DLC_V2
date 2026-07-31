package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.PricingConflictException;
import com.linercore.platform.chargeagreement.applicationservice.PricingRequestInProgressException;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingApplicationService.PricingUnavailableException;
import com.linercore.platform.chargeagreement.container.PricingServiceIdentityFilter;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PricingApiController {
    static final String PRICING_MEDIA_TYPE = "application/vnd.api.v1+json";

    private final PricingApplicationService service;

    public PricingApiController(PricingApplicationService service) {
        this.service = service;
    }

    @PostMapping(path = "/pricing-requests", consumes = PRICING_MEDIA_TYPE, produces = PRICING_MEDIA_TYPE)
    public ResponseEntity<?> requestPricing(
            @RequestBody PricingRequestBody body,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestHeader("X-Correlation-Id") String correlationId,
            @RequestAttribute(PricingServiceIdentityFilter.VERIFIED_SERVICE_ATTRIBUTE) String actorSubjectId) {
        PricingRequest request = body.toDomain(correlationId);
        var result = service.requestPricing(request, idempotencyKey, actorSubjectId);
        return ResponseEntity.status(result.httpStatus())
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header("X-Pricing-Replayed", Boolean.toString(result.replayed()))
                .body(result.body());
    }

    private static String safeMessage(String reasonCode) {
        return switch (reasonCode) {
            case "NO_RATE" -> "No active agreement or tariff rate matched the pricing request";
            case "AMBIGUOUS_AGREEMENT_AUTHORITY" -> "Multiple approved agreements matched the pricing request";
            case "AMBIGUOUS_BASE_RATE", "AMBIGUOUS_SURCHARGE_RATE", "AMBIGUOUS_LOCAL_RATE" ->
                    "Multiple approved tariff rates matched the pricing request";
            default -> "Pricing validation failed";
        };
    }

    private static ChargeLineResponse line(PricingLine line) {
        return new ChargeLineResponse(line.chargeCodeId().value(), line.category().name(),
                line.amount().amount().setScale(2), "USD", line.rateCategory().name(),
                line.providerBasis().name(), line.quantity(), line.unitRate(),
                line.sourceRateVersionId());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(
            IllegalArgumentException exception,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error("PRICING_BAD_REQUEST", exception.getMessage(), request));
    }

    @ExceptionHandler(PricingConflictException.class)
    public ResponseEntity<ErrorResponse> conflict(
            PricingConflictException exception,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error(exception.code(), exception.getMessage(), request));
    }

    @ExceptionHandler(PricingRequestInProgressException.class)
    public ResponseEntity<ErrorResponse> inProgress(
            PricingRequestInProgressException exception,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("Retry-After", String.valueOf(Math.max(1, exception.retryAfter().toSeconds())))
                .body(error("PRICING_IN_PROGRESS", exception.getMessage(), request));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> forbidden(SecurityException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(error("PRICING_FORBIDDEN", "Pricing access denied", request));
    }

    @ExceptionHandler(PricingUnavailableException.class)
    public ResponseEntity<ErrorResponse> unavailable(
            PricingUnavailableException exception,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(error("PRICING_UNAVAILABLE", "Pricing is unavailable", request));
    }

    private static ErrorResponse error(String code, String message, HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-Id");
        return new ErrorResponse(code, message,
                correlationId == null || correlationId.isBlank() ? "rejected" : correlationId,
                null, null, null);
    }

    public record PricingRequestBody(
            String bookingRef,
            String tradeLane,
            String pol,
            String pod,
            String equipmentType,
            String partyId,
            String commodityCode,
            boolean reeferIndicator,
            boolean dgIndicator,
            PricingDatesBody dates,
            PricingQuantitiesBody quantities) {
        PricingRequest toDomain(String correlationId) {
            return new PricingRequest(bookingRef, tradeLane, pol, pod, equipmentType, partyId, commodityCode,
                    reeferIndicator, dgIndicator,
                    new PricingRequest.PricingDates(dates.effectiveDate(), dates.requestedDepartureDate()),
                    new PricingRequest.PricingQuantities(quantities.equipmentQuantity(), quantities.teu(),
                            quantities.amendmentSeq()),
                    correlationId);
        }
    }

    public record PricingDatesBody(LocalDate effectiveDate, LocalDate requestedDepartureDate) {
    }

    public record PricingQuantitiesBody(int equipmentQuantity, int teu, int amendmentSeq) {
    }

    public record PricingResultResponse(
            String bookingRef,
            String pricingBasis,
            String pricingRef,
            List<ChargeLineResponse> charges,
            List<String> applicableDndRuleTypes,
            BigDecimal total,
            String currency,
            LocalDate requestedDepartureDate,
            String pricingRequestId,
            String correlationId,
            Instant pricedAt,
            String agreementVersionId) {
    }

    public record ChargeLineResponse(
            String chargeCode,
            String category,
            BigDecimal amount,
            String currency,
            String rateCategory,
            String basis,
            int quantity,
            BigDecimal unitRate,
            String sourceRateVersionId) {
    }

    public record ErrorResponse(
            String code,
            String message,
            String correlationId,
            String reasonCode,
            String pricingRequestId,
            String manualCaseId) {
    }
}
