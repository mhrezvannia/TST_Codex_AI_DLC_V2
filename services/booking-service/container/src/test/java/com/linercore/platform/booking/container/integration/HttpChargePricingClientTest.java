package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClientException;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingFailureType;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Semaphore;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class HttpChargePricingClientTest {
    private static final byte[] CANONICAL_BODY = """
            {"bookingRef":"BKG-1","tradeLane":"NA-EU","pol":"NLRTM","pod":"SGSIN","equipmentType":"45G1","partyId":"party-1","commodityCode":"GEN","reeferIndicator":false,"dgIndicator":false,"dates":{"effectiveDate":"2026-08-01","requestedDepartureDate":"2026-08-01"},"quantities":{"equipmentQuantity":2,"teu":4,"amendmentSeq":0}}\
            """.getBytes(StandardCharsets.UTF_8);

    @Test
    void sendsExactCapturedBytesKeyAndTrustedHeaders() {
        RestTemplate rest = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(rest).build();
        server.expect(requestTo("http://charge/pricing-requests"))
                .andExpect(header("Idempotency-Key", "BKG-1:0"))
                .andExpect(header("X-LinerCore-Service-Id", "booking-service"))
                .andExpect(header("X-LinerCore-Service-Token", "trusted-token"))
                .andExpect(header("X-Correlation-Id", "corr-1"))
                .andExpect(request -> {
                    assertArrayEquals(CANONICAL_BODY, request.getBody().readAllBytes());
                    assertNull(request.getHeaders().getFirst("X-LinerCore-Actor-Id"));
                })
                .andRespond(withSuccess(successBody(), pricingMediaType()));
        HttpChargePricingClient client = client(rest, new Semaphore(10, true));

        var response = client.quote(CANONICAL_BODY, "BKG-1:0", "corr-1");

        assertEquals("BKG-1:0", response.pricingRequestId());
        assertEquals("PER_CONTAINER", response.lineItems().get(0).basis());
        assertEquals("rv-base", response.lineItems().get(0).sourceRateVersionId());
        assertEquals("agreement-version-u04", response.agreementVersionId());
        server.verify();
    }

    @Test
    void preservesNoRateCaseAndProviderCorrelation() {
        RestTemplate rest = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(rest).build();
        server.expect(requestTo("http://charge/pricing-requests"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                        .contentType(pricingMediaType())
                        .body("""
                                {"code":"NO_RATE","message":"No rate","correlationId":"corr-provider",
                                 "reasonCode":"NO_RATE","pricingRequestId":"BKG-1:0",
                                 "manualCaseId":"case-1"}
                                """));
        HttpChargePricingClient client = client(rest, new Semaphore(10, true));

        ChargePricingClientException exception = assertThrows(
                ChargePricingClientException.class,
                () -> client.quote(CANONICAL_BODY, "BKG-1:0", "corr-1"));

        assertEquals(ChargePricingFailureType.MANUAL, exception.failureType());
        assertEquals("NO_RATE", exception.reasonCode());
        assertEquals("BKG-1:0", exception.pricingRequestId());
        assertEquals("case-1", exception.manualCaseId());
        assertEquals("corr-provider", exception.correlationId());
    }

    @Test
    void preservesPricingValidationWithoutManualRelabeling() {
        RestTemplate rest = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(rest).build();
        server.expect(requestTo("http://charge/pricing-requests"))
                .andRespond(withStatus(HttpStatus.UNPROCESSABLE_ENTITY)
                        .contentType(pricingMediaType())
                        .body("""
                                {"code":"PRICING_VALIDATION","message":"Invalid","correlationId":"corr-1"}
                                """));
        HttpChargePricingClient client = client(rest, new Semaphore(10, true));

        ChargePricingClientException exception = assertThrows(
                ChargePricingClientException.class,
                () -> client.quote(CANONICAL_BODY, "BKG-1:0", "corr-1"));

        assertEquals(ChargePricingFailureType.VALIDATION, exception.failureType());
        assertEquals("PRICING_VALIDATION", exception.reasonCode());
    }

    @Test
    void releasesPermitAfterSuccessfulSynchronousResponse() {
        RestTemplate rest = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(rest).build();
        server.expect(requestTo("http://charge/pricing-requests"))
                .andRespond(withSuccess(successBody(), pricingMediaType()));
        Semaphore permits = new Semaphore(10, true);

        client(rest, permits).quote(CANONICAL_BODY, "BKG-1:0", "corr-1");

        assertEquals(10, permits.availablePermits());
    }

    @Test
    void failsClosedWhenTrustedTokenIsAbsent() {
        HttpChargePricingClient client = new HttpChargePricingClient(
                new RestTemplate(),
                "http://charge",
                "booking-service",
                "",
                new Semaphore(10, true));

        ChargePricingClientException exception = assertThrows(
                ChargePricingClientException.class,
                () -> client.quote(CANONICAL_BODY, "BKG-1:0", "corr-1"));

        assertEquals("SERVICE_IDENTITY_MISSING", exception.reasonCode());
    }

    private static HttpChargePricingClient client(RestTemplate rest, Semaphore permits) {
        return new HttpChargePricingClient(
                rest, "http://charge", "booking-service", "trusted-token", permits);
    }

    private static MediaType pricingMediaType() {
        return MediaType.parseMediaType("application/vnd.api.v1+json");
    }

    private static String successBody() {
        return """
                {"bookingRef":"BKG-1","pricingBasis":"AGREEMENT",
                 "pricingRef":"agreement-version-u04",
                 "charges":[
                   {"chargeCode":"OFR","category":"FREIGHT","amount":200.00,"currency":"USD",
                    "rateCategory":"BASE","basis":"PER_CONTAINER","quantity":2,
                    "unitRate":100.00,"sourceRateVersionId":"rv-base"},
                   {"chargeCode":"BAF","category":"SURCHARGE","amount":40.00,"currency":"USD",
                    "rateCategory":"SURCHARGE","basis":"PER_CONTAINER","quantity":2,
                    "unitRate":20.00,"sourceRateVersionId":"rv-baf"},
                   {"chargeCode":"THC","category":"LOCAL","amount":20.00,"currency":"USD",
                    "rateCategory":"LOCAL","basis":"PER_CONTAINER","quantity":2,
                    "unitRate":10.00,"sourceRateVersionId":"rv-thc"}],
                 "applicableDndRuleTypes":[],"total":260.00,"currency":"USD",
                 "requestedDepartureDate":"2026-08-01","pricingRequestId":"BKG-1:0",
                 "correlationId":"corr-1","pricedAt":"2026-07-29T08:00:00Z",
                 "agreementVersionId":"agreement-version-u04"}
                """;
    }
}
