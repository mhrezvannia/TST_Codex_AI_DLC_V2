package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.PricingConflictException;
import com.linercore.platform.chargeagreement.applicationservice.PricingRequestInProgressException;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PricingApiController {
    static final String PRICING_MEDIA_TYPE = "application/vnd.api.v1+json";

    private final ChargeAgreementApplicationService service;

    public PricingApiController(ChargeAgreementApplicationService service) {
        this.service = service;
    }

    @PostMapping(path = "/pricing-requests", consumes = PRICING_MEDIA_TYPE, produces = PRICING_MEDIA_TYPE)
    public ResponseEntity<?> requestPricing(
            @RequestBody PricingRequestBody body,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestHeader("X-Correlation-Id") String correlationId,
            @RequestHeader(name = "X-LinerCore-Actor-Id", defaultValue = "booking-service") String actorSubjectId) {
        PricingRequest request = body.toDomain(correlationId);
        PricingResult result = service.requestPricing(request, idempotencyKey, actorSubjectId);
        if (result.manualPricingRequired()) {
            HttpStatus status = "NO_RATE".equals(result.reasonCode()) ? HttpStatus.NOT_FOUND : HttpStatus.UNPROCESSABLE_ENTITY;
            return ResponseEntity.status(status)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponse(result.reasonCode().equals("NO_RATE") ? "NO_RATE" : "PRICING_VALIDATION",
                            safeMessage(result.reasonCode()), result.correlationId()));
        }
        return ResponseEntity.ok(new PricingResultResponse(bookingRefFrom(result.pricingRequestId()), result.pricingBasis(),
                result.pricingRef(), result.lines().stream().map(PricingApiController::line).toList(),
                List.of()));
    }

    private static String bookingRefFrom(String pricingRequestId) {
        if (pricingRequestId == null) {
            return "";
        }
        int delimiter = pricingRequestId.lastIndexOf(':');
        return delimiter < 0 ? pricingRequestId : pricingRequestId.substring(0, delimiter);
    }

    private static String safeMessage(String reasonCode) {
        return switch (reasonCode) {
            case "NO_RATE" -> "No active agreement or tariff rate matched the pricing request";
            case "AMBIGUOUS_ACTIVE_AGREEMENT" -> "Multiple active agreements matched the pricing request";
            case "NO_APPLICABLE_TERMS" -> "No applicable agreement terms matched the pricing request";
            default -> "Pricing validation failed";
        };
    }

    private static ChargeLineResponse line(PricingLine line) {
        return new ChargeLineResponse(line.chargeCodeId().value(), line.category().name(),
                line.amount().amount().setScale(2), line.amount().currencyId().value().toUpperCase());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("PRICING_BAD_REQUEST", exception.getMessage(), "local-correlation"));
    }

    @ExceptionHandler(PricingConflictException.class)
    public ResponseEntity<ErrorResponse> conflict(PricingConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(exception.code(), exception.getMessage(), "local-correlation"));
    }

    @ExceptionHandler(PricingRequestInProgressException.class)
    public ResponseEntity<ErrorResponse> inProgress(PricingRequestInProgressException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("Retry-After", String.valueOf(Math.max(1, exception.retryAfter().toSeconds())))
                .body(new ErrorResponse("PRICING_IN_PROGRESS", exception.getMessage(), "local-correlation"));
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
            List<Object> applicableDndRuleTypes) {
    }

    public record ChargeLineResponse(String chargeCode, String category, BigDecimal amount, String currency) {
    }

    public record ErrorResponse(String code, String message, String correlationId) {
    }
}
