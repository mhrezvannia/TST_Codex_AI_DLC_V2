package com.linercore.platform.chargeagreement.container.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingTerminalRenderer;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.pricing.PricingTerminalReason;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class JacksonPricingTerminalRenderer implements PricingTerminalRenderer {
    private final ObjectMapper mapper;

    public JacksonPricingTerminalRenderer(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public byte[] renderSuccess(PricingResult result) {
        return write(new SuccessResponse(
                result.bookingRef(), result.pricingBasis(), result.pricingRef(),
                result.lines().stream().map(JacksonPricingTerminalRenderer::line).toList(),
                result.applicableDndRuleTypes(), result.totalAmount(), "USD",
                result.requestedDepartureDate(), result.pricingRequestId(), result.correlationId(),
                result.pricedAt(), result.agreementVersionId()));
    }

    @Override
    public byte[] renderManual(
            PricingRequest request,
            PricingTerminalReason reason,
            String manualCaseId,
            Instant terminalAt) {
        return write(new ManualError(
                reason.publicCode(),
                reason == PricingTerminalReason.NO_RATE
                        ? "No approved pricing authority matched the request"
                        : "Pricing authority is ambiguous",
                request.correlationId(),
                reason.name(),
                request.pricingRequestId(),
                manualCaseId));
    }

    private byte[] write(Object value) {
        try {
            return mapper.writeValueAsBytes(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("pricing terminal serialization failed", exception);
        }
    }

    private static LineResponse line(PricingLine line) {
        return new LineResponse(
                line.chargeCodeId().value(), line.category().name(), line.amount().amount(), "USD",
                line.rateCategory().name(), line.providerBasis().name(), line.quantity(),
                line.unitRate(), line.sourceRateVersionId());
    }

    public record SuccessResponse(
            String bookingRef,
            String pricingBasis,
            String pricingRef,
            List<LineResponse> charges,
            List<String> applicableDndRuleTypes,
            BigDecimal total,
            String currency,
            LocalDate requestedDepartureDate,
            String pricingRequestId,
            String correlationId,
            Instant pricedAt,
            @JsonInclude(JsonInclude.Include.NON_NULL)
            String agreementVersionId) {
    }

    public record LineResponse(
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

    public record ManualError(
            String code,
            String message,
            String correlationId,
            String reasonCode,
            String pricingRequestId,
            String manualCaseId) {
    }
}
