package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClient;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClientException;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingFailureType;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingLineItem;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingRequest;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

public class HttpChargePricingClient implements ChargePricingClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpChargePricingClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    @Override
    public ChargePricingResponse quote(ChargePricingRequest request) throws ChargePricingClientException {
        String uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path("/api/charge-agreements/active-lookup")
                .queryParam("customerId", request.customerId())
                .queryParam("originLocationId", request.originLocationId())
                .queryParam("destinationLocationId", request.destinationLocationId())
                .queryParam("effectiveDate", LocalDate.now())
                .queryParam("actor", "booking-service")
                .toUriString();
        try {
            ActiveLookupResponse response = restTemplate.getForObject(uri, ActiveLookupResponse.class);
            if (response == null || !response.matched()) {
                return new ChargePricingResponse(null, "MANUAL", List.of(), true, "NO_ACTIVE_AGREEMENT",
                        request.correlationId());
            }
            List<ChargePricingLineItem> lineItems = response.terms().stream()
                    .map(term -> new ChargePricingLineItem(term.chargeCodeId(), term.basis(), 1,
                            term.amount().toPlainString(), term.currencyId()))
                    .toList();
            return new ChargePricingResponse("agreement-" + response.agreementId(), "AGREEMENT", lineItems,
                    false, null, request.correlationId());
        } catch (RestClientResponseException ex) {
            ChargePricingFailureType type = ex.getStatusCode().is4xxClientError()
                    ? ChargePricingFailureType.VALIDATION
                    : ChargePricingFailureType.TRANSIENT;
            throw new ChargePricingClientException(type, "CHARGE_AGREEMENT_LOOKUP_FAILED",
                    "charge agreement lookup failed: " + ex.getStatusText());
        }
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
}
