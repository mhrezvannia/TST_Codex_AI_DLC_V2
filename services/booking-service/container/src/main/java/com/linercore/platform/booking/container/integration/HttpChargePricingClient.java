package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClient;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClientException;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingFailureType;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingLineItem;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingRequest;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

public class HttpChargePricingClient implements ChargePricingClient {
    private static final String PRICING_MEDIA_TYPE = "application/vnd.api.v1+json";

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpChargePricingClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    @Override
    public ChargePricingResponse quote(ChargePricingRequest request) throws ChargePricingClientException {
        try {
            PricingResponse response = restTemplate.exchange(baseUrl + "/pricing-requests", HttpMethod.POST,
                    new HttpEntity<>(PricingRequestBody.from(request), headers(request)), PricingResponse.class)
                    .getBody();
            if (response == null) {
                throw new ChargePricingClientException(ChargePricingFailureType.TRANSIENT,
                        "PRICING_UNAVAILABLE", "Charge pricing returned an empty response");
            }
            List<ChargePricingLineItem> lineItems = response.charges().stream()
                    .map(line -> new ChargePricingLineItem(line.chargeCode(), line.category(), null,
                            1, line.amount(), line.currency()))
                    .toList();
            return new ChargePricingResponse(response.pricingRef(), response.pricingBasis(), lineItems,
                    false, null, request.correlationId());
        } catch (RestClientResponseException ex) {
            ErrorResponse error = null;
            try {
                error = ex.getResponseBodyAs(ErrorResponse.class);
            } catch (RuntimeException ignored) {
                // Fall through to status-based classification.
            }
            String code = error == null ? "PRICING_UNAVAILABLE" : error.code();
            if (ex.getStatusCode().value() == 404 || ex.getStatusCode().value() == 422) {
                return new ChargePricingResponse(null, "MANUAL", List.of(), true, code, request.correlationId());
            }
            ChargePricingFailureType type = ex.getStatusCode().is4xxClientError()
                    ? ChargePricingFailureType.VALIDATION
                    : ChargePricingFailureType.TRANSIENT;
            throw new ChargePricingClientException(type, code, error == null ? ex.getStatusText() : error.message());
        }
    }

    private HttpHeaders headers(ChargePricingRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(PRICING_MEDIA_TYPE));
        headers.setAccept(List.of(MediaType.parseMediaType(PRICING_MEDIA_TYPE)));
        headers.set("Idempotency-Key", request.idempotencyKey());
        headers.set("X-Correlation-Id", request.correlationId());
        headers.set("X-LinerCore-Actor-Id", "booking-service");
        return headers;
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    public record ActiveLookupResponse(boolean matched, String agreementId, List<TermResponse> terms, String noMatchReason) {
        public ActiveLookupResponse {
            terms = List.copyOf(terms == null ? List.of() : terms);
        }
    }

    public record TermResponse(
            String id,
            String chargeCodeId,
            String basis,
            java.math.BigDecimal amount,
            String currencyId,
            LocalDate validFrom,
            LocalDate validTo,
            String notes) {
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
            PricingDates dates,
            PricingQuantities quantities) {
        static PricingRequestBody from(ChargePricingRequest request) {
            LocalDate effective = LocalDate.now();
            return new PricingRequestBody(request.bookingId(), request.tradeLane(), request.originLocationId(),
                    request.destinationLocationId(), request.equipmentType(), request.customerId(),
                    request.commodityCode(), request.reefer(), request.dangerousGoods(),
                    new PricingDates(effective, effective),
                    new PricingQuantities(request.equipmentQuantity(), request.teu(), request.amendmentSeq()));
        }
    }

    public record PricingDates(LocalDate effectiveDate, LocalDate requestedDepartureDate) {
    }

    public record PricingQuantities(int equipmentQuantity, int teu, int amendmentSeq) {
    }

    public record PricingResponse(String bookingRef, String pricingBasis, String pricingRef,
                                  List<PricingLineResponse> charges, List<Object> applicableDndRuleTypes) {
        public PricingResponse {
            charges = List.copyOf(charges == null ? List.of() : charges);
        }
    }

    public record PricingLineResponse(String chargeCode, String category, String amount, String currency) {
    }

    public record ErrorResponse(String code, String message, String correlationId) {
    }
}
