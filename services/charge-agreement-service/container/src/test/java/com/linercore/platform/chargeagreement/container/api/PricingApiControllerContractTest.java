package com.linercore.platform.chargeagreement.container.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.linercore.platform.chargeagreement.applicationservice.PricingConflictException;
import com.linercore.platform.chargeagreement.applicationservice.PricingRequestInProgressException;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingApplicationService.PricingUnavailableException;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingProviderResponse;
import com.linercore.platform.chargeagreement.container.PricingServiceIdentityFilter;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PricingApiControllerContractTest {
    private static final String MEDIA = PricingApiController.PRICING_MEDIA_TYPE;
    private static final String CORRELATION = "corr-controller-u04";
    private static final byte[] AGREEMENT_SUCCESS = """
            {"bookingRef":"BK-U04","pricingBasis":"AGREEMENT","pricingRef":"agreement-version-u04",
             "charges":[
               {"chargeCode":"OFR","category":"FREIGHT","amount":200.00,"currency":"USD","rateCategory":"BASE","basis":"PER_CONTAINER","quantity":2,"unitRate":100.00,"sourceRateVersionId":"rv-base"},
               {"chargeCode":"BAF","category":"SURCHARGE","amount":40.00,"currency":"USD","rateCategory":"SURCHARGE","basis":"PER_CONTAINER","quantity":2,"unitRate":20.00,"sourceRateVersionId":"rv-baf"},
               {"chargeCode":"THC","category":"LOCAL","amount":20.00,"currency":"USD","rateCategory":"LOCAL","basis":"PER_CONTAINER","quantity":2,"unitRate":10.00,"sourceRateVersionId":"rv-thc"}],
             "applicableDndRuleTypes":[],"total":260.00,"currency":"USD",
             "requestedDepartureDate":"2026-08-01","pricingRequestId":"BK-U04:3",
             "correlationId":"corr-controller-u04","pricedAt":"2026-07-28T08:00:00Z",
             "agreementVersionId":"agreement-version-u04"}
            """.replaceAll("\\s+", "").getBytes(StandardCharsets.UTF_8);
    private static final byte[] TARIFF_SUCCESS =
            new String(AGREEMENT_SUCCESS, StandardCharsets.UTF_8)
                    .replace("\"AGREEMENT\"", "\"TARIFF\"")
                    .replace("\"agreement-version-u04\"", "\"TARIFF-0123456789abcdef01234567\"")
                    .replace(",\"agreementVersionId\":\"TARIFF-0123456789abcdef01234567\"", "")
                    .getBytes(StandardCharsets.UTF_8);

    private PricingApplicationService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(PricingApplicationService.class);
        mvc = MockMvcBuilders.standaloneSetup(new PricingApiController(service)).build();
    }

    @Test
    void rejectsWrongMediaMalformedBodyAndMismatchedDatesBeforeProviderWork() throws Exception {
        mvc.perform(post("/pricing-requests")
                        .contentType("application/json")
                        .content(validRequest())
                        .requestAttr(PricingServiceIdentityFilter.VERIFIED_SERVICE_ATTRIBUTE, "booking-service")
                        .header("Idempotency-Key", "BK-U04:3")
                        .header("X-Correlation-Id", CORRELATION))
                .andExpect(status().isUnsupportedMediaType());

        mvc.perform(request("{\"bookingRef\":"))
                .andExpect(status().isBadRequest());
        mvc.perform(request(validRequest().replace(
                        "\"requestedDepartureDate\":\"2026-08-01\"",
                        "\"requestedDepartureDate\":\"2026-08-02\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PRICING_BAD_REQUEST"))
                .andExpect(jsonPath("$.correlationId").value(CORRELATION));
        verifyNoInteractions(service);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("terminalMatrix")
    void publishesEverySuccessAndManualTerminalWithExactBytes(
            String name,
            int statusCode,
            String contentType,
            byte[] body,
            boolean replayed) throws Exception {
        reset(service);
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenReturn(new PricingProviderResponse(statusCode, contentType, body, replayed));

        mvc.perform(request(validRequest()))
                .andExpect(status().is(statusCode))
                .andExpect(content().contentTypeCompatibleWith(contentType))
                .andExpect(header().string("X-Pricing-Replayed", Boolean.toString(replayed)))
                .andExpect(content().bytes(body));
    }

    @Test
    void preservesConflictInProgressDeniedUnavailableAndCorrelationMappings() throws Exception {
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenThrow(new PricingConflictException(
                        "IDEMPOTENCY_CONFLICT", "key belongs to another request"));
        mvc.perform(request(validRequest()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"))
                .andExpect(jsonPath("$.correlationId").value(CORRELATION));

        reset(service);
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenThrow(new PricingRequestInProgressException(Duration.ofSeconds(3)));
        mvc.perform(request(validRequest()))
                .andExpect(status().isConflict())
                .andExpect(header().string("Retry-After", "3"))
                .andExpect(jsonPath("$.code").value("PRICING_IN_PROGRESS"));

        reset(service);
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenThrow(new SecurityException("denied"));
        mvc.perform(request(validRequest()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PRICING_FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Pricing access denied"));

        reset(service);
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenThrow(new PricingUnavailableException("database unavailable"));
        mvc.perform(request(validRequest()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("PRICING_UNAVAILABLE"))
                .andExpect(jsonPath("$.correlationId").value(CORRELATION));
    }

    @Test
    void replayReturnsTheStoredBytesWithoutReserialization() throws Exception {
        byte[] stored = manualBody("NO_RATE", "MANUAL_PRICING_REQUIRED", "case-byte-stable");
        when(service.requestPricing(any(), anyString(), anyString()))
                .thenReturn(new PricingProviderResponse(404, "application/json", stored, true));

        mvc.perform(request(validRequest()))
                .andExpect(status().isNotFound())
                .andExpect(content().bytes(stored))
                .andExpect(jsonPath("$.reasonCode").value("NO_RATE"))
                .andExpect(jsonPath("$.pricingRequestId").value("BK-U04:3"))
                .andExpect(jsonPath("$.manualCaseId").value("case-byte-stable"));
        mvc.perform(request(validRequest()))
                .andExpect(status().isNotFound())
                .andExpect(content().bytes(stored));
    }

    private static Stream<Arguments> terminalMatrix() {
        return Stream.of(
                Arguments.of("agreement-success", 200, MEDIA, AGREEMENT_SUCCESS, false),
                Arguments.of("tariff-success", 200, MEDIA, TARIFF_SUCCESS, false),
                Arguments.of("no-rate", 404, "application/json",
                        manualBody("NO_RATE", "MANUAL_PRICING_REQUIRED", "case-no-rate"), false),
                Arguments.of("agreement-ambiguity", 422, "application/json",
                        manualBody("AMBIGUOUS_AGREEMENT_AUTHORITY", "PRICING_VALIDATION", "case-agreement"), false),
                Arguments.of("base-ambiguity", 422, "application/json",
                        manualBody("AMBIGUOUS_BASE_RATE", "PRICING_VALIDATION", "case-base"), false),
                Arguments.of("surcharge-ambiguity", 422, "application/json",
                        manualBody("AMBIGUOUS_SURCHARGE_RATE", "PRICING_VALIDATION", "case-surcharge"), false),
                Arguments.of("local-ambiguity", 422, "application/json",
                        manualBody("AMBIGUOUS_LOCAL_RATE", "PRICING_VALIDATION", "case-local"), true));
    }

    private static byte[] manualBody(String reason, String code, String caseId) {
        return ("{\"code\":\"" + code + "\",\"message\":\"safe terminal message\","
                + "\"correlationId\":\"" + CORRELATION + "\",\"reasonCode\":\"" + reason + "\","
                + "\"pricingRequestId\":\"BK-U04:3\",\"manualCaseId\":\"" + caseId + "\"}")
                .getBytes(StandardCharsets.UTF_8);
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request(String body) {
        return post("/pricing-requests")
                .contentType(MEDIA)
                .accept(MEDIA)
                .content(body)
                .requestAttr(PricingServiceIdentityFilter.VERIFIED_SERVICE_ATTRIBUTE, "booking-service")
                .header("Idempotency-Key", "BK-U04:3")
                .header("X-Correlation-Id", CORRELATION);
    }

    private String validRequest() {
        return """
                {
                  "bookingRef":"BK-U04",
                  "tradeLane":"lane-1",
                  "pol":"USNYC",
                  "pod":"NLRTM",
                  "equipmentType":"22G1",
                  "partyId":"party-1",
                  "commodityCode":"commodity-1",
                  "reeferIndicator":false,
                  "dgIndicator":false,
                  "dates":{"effectiveDate":"2026-08-01","requestedDepartureDate":"2026-08-01"},
                  "quantities":{"equipmentQuantity":2,"teu":4,"amendmentSeq":3}
                }
                """;
    }
}
