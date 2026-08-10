package com.linercore.platform.chargeagreement.container;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFilter;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionReplayCache;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionVerifier;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PricingOpenApiSecurityFilterContractTest {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final byte[] ASSERTION_SECRET =
            "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8);
    private static final long NOW = 1_785_312_000L;

    @Test
    void pricingOperationContractMatchesTheRealIdentityFilter() throws Exception {
        PricingServiceIdentityFilter filter =
                new PricingServiceIdentityFilter("booking-service", "test-secret");

        assertPricingFailure(filter, request(), 401, "PRICING_SERVICE_IDENTITY_REQUIRED");

        MockHttpServletRequest spoofed = request();
        spoofed.addHeader("X-LinerCore-Actor-Id", "actor");
        assertPricingFailure(filter, spoofed, 400, "PRICING_IDENTITY_SPOOF_REJECTED");

        MockHttpServletRequest unsafeCorrelation = trustedRequest();
        unsafeCorrelation.removeHeader("X-Correlation-Id");
        assertPricingFailure(filter, unsafeCorrelation, 400, "PRICING_CORRELATION_INVALID");

        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(trustedRequest(), new MockHttpServletResponse(), chain);
        assertThat(chain.getRequest()).isNotNull();

        String contract = openApi();
        assertThat(contract).contains(
                "name: X-LinerCore-Service-Id",
                "name: X-LinerCore-Service-Token",
                "'401':",
                "PRICING_SERVICE_IDENTITY_REQUIRED",
                "PRICING_IDENTITY_SPOOF_REJECTED",
                "PRICING_CORRELATION_INVALID");
    }

    @Test
    void manualOperationsContractMatchesInvalidCapacityAndValidRealFilterPaths() throws Exception {
        for (String path : new String[] {"/api/manual-pricing-cases", "/api/manual-pricing-cases/case-1"}) {
            ChargeSubjectAssertionFilter filter = filter(new ChargeSubjectAssertionReplayCache(4096));
            MockHttpServletRequest request = manualRequest(path);
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, new MockFilterChain());
            assertError(response, 401, "INVALID_SUBJECT_ASSERTION", Set.of("code", "message", "fields"));
        }

        ChargeSubjectAssertionReplayCache fullCache = new ChargeSubjectAssertionReplayCache(4096);
        for (int index = 0; index < 4096; index++) {
            assertThat(fullCache.claim("occupied", "nonce-" + index, NOW + 30, NOW).name())
                    .isEqualTo("CLAIMED");
        }
        ChargeSubjectAssertionFilter exhausted = filter(fullCache);
        MockHttpServletRequest capacityRequest = manualRequest("/api/manual-pricing-cases");
        capacityRequest.addHeader(
                "X-LinerCore-Subject-Assertion",
                assertion("GET", "/api/manual-pricing-cases", "corr-manual", 7));
        MockHttpServletResponse capacityResponse = new MockHttpServletResponse();
        exhausted.doFilter(capacityRequest, capacityResponse, new MockFilterChain());
        assertError(
                capacityResponse,
                503,
                "SUBJECT_ASSERTION_CAPACITY_EXHAUSTED",
                Set.of("code", "message", "fields"));

        ChargeSubjectAssertionFilter valid = filter(new ChargeSubjectAssertionReplayCache(4096));
        MockHttpServletRequest validRequest = manualRequest("/api/manual-pricing-cases");
        validRequest.addHeader(
                "X-LinerCore-Subject-Assertion",
                assertion("GET", "/api/manual-pricing-cases", "corr-manual", 8));
        MockFilterChain chain = new MockFilterChain();
        valid.doFilter(validRequest, new MockHttpServletResponse(), chain);
        assertThat(chain.getRequest()).isNotNull();

        String contract = openApi();
        assertThat(contract).contains(
                "name: X-LinerCore-Subject-Assertion",
                "SubjectAssertionUnauthorized",
                "ManualCaseUnavailable",
                "INVALID_SUBJECT_ASSERTION",
                "SUBJECT_ASSERTION_CAPACITY_EXHAUSTED",
                "required: [code, message, fields]");
    }

    private static void assertPricingFailure(
            PricingServiceIdentityFilter filter,
            MockHttpServletRequest request,
            int status,
            String code) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        assertError(response, status, code, Set.of("code", "message", "correlationId"));
    }

    private static void assertError(
            MockHttpServletResponse response,
            int status,
            String code,
            Set<String> fields) throws Exception {
        JsonNode body = MAPPER.readTree(response.getContentAsByteArray());
        assertThat(response.getStatus()).isEqualTo(status);
        assertThat(body.path("code").asText()).isEqualTo(code);
        java.util.List<String> actualFields = new java.util.ArrayList<>();
        body.fieldNames().forEachRemaining(actualFields::add);
        assertThat(actualFields).containsExactlyInAnyOrderElementsOf(fields);
    }

    private static MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/pricing-requests");
        request.addHeader("X-Correlation-Id", "corr-pricing");
        return request;
    }

    private static MockHttpServletRequest trustedRequest() {
        MockHttpServletRequest request = request();
        request.addHeader("X-LinerCore-Service-Id", "booking-service");
        request.addHeader("X-LinerCore-Service-Token", "test-secret");
        return request;
    }

    private static MockHttpServletRequest manualRequest(String path) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.addHeader("X-Correlation-Id", "corr-manual");
        return request;
    }

    private static ChargeSubjectAssertionFilter filter(ChargeSubjectAssertionReplayCache cache) {
        return new ChargeSubjectAssertionFilter(new ChargeSubjectAssertionVerifier(
                "test-kid",
                ASSERTION_SECRET,
                cache,
                Clock.fixed(Instant.ofEpochSecond(NOW), ZoneOffset.UTC)));
    }

    private static String assertion(String method, String path, String correlation, int nonceByte)
            throws Exception {
        byte[] nonceBytes = new byte[16];
        java.util.Arrays.fill(nonceBytes, (byte) nonceByte);
        String nonce = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(nonceBytes);
        String payload = "lc-bff-assertion:v1\n"
                + field("iss", "charge-agreements-bff")
                + field("kid", "test-kid")
                + field("sub", "operator-1")
                + field("mth", method)
                + field("pth", path)
                + field("cid", correlation)
                + field("iat", Long.toString(NOW))
                + field("exp", Long.toString(NOW + 30))
                + field("nonce", nonce);
        String encoded = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signingInput = "v1.test-kid." + encoded;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(ASSERTION_SECRET, "HmacSHA256"));
        return signingInput + "." + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(signingInput.getBytes(StandardCharsets.US_ASCII)));
    }

    private static String field(String name, String value) {
        return name + ":" + value.getBytes(StandardCharsets.UTF_8).length + ":" + value + "\n";
    }

    private static String openApi() throws Exception {
        Path current = Path.of("").toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve("contracts/openapi/pricing.v1.yaml");
            if (Files.isRegularFile(candidate)) {
                return Files.readString(candidate);
            }
            current = current.getParent();
        }
        throw new IllegalStateException("pricing OpenAPI was not found");
    }
}
