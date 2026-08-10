package com.linercore.platform.chargeagreement.container.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ChargeSubjectAssertionVerifierTest {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void verifiesEverySharedGoldenVectorAndClaimsNonceOnce() throws Exception {
        for (JsonNode vector : fixture().path("vectors")) {
            JsonNode claims = vector.path("claims");
            ChargeSubjectAssertionReplayCache cache = new ChargeSubjectAssertionReplayCache(4096);
            ChargeSubjectAssertionVerifier verifier = verifier(vector, cache);

            ChargeSubjectAssertionResult result = verifier.verify(
                    vector.path("headerValue").asText(),
                    claims.path("mth").asText(),
                    claims.path("pth").asText(),
                    claims.path("cid").asText());

            assertThat(result.valid()).as(vector.path("id").asText()).isTrue();
            assertThat(result.claims().subject()).isEqualTo(claims.path("sub").asText());
            assertThat(cache.occupancy(vector.path("verificationInstant").asLong())).isEqualTo(1);
            assertThat(verifier.verify(
                    vector.path("headerValue").asText(),
                    claims.path("mth").asText(),
                    claims.path("pth").asText(),
                    claims.path("cid").asText()).failure())
                    .isEqualTo(ChargeSubjectAssertionFailure.INVALID_SUBJECT_ASSERTION);
        }
    }

    @Test
    void rejectsSignatureContextAndExpiredAssertions() throws Exception {
        JsonNode vector = fixture().path("vectors").get(0);
        JsonNode claims = vector.path("claims");
        ChargeSubjectAssertionVerifier verifier = verifier(
                vector, new ChargeSubjectAssertionReplayCache(4096));
        String header = vector.path("headerValue").asText();

        assertThat(verifier.verify(header.substring(0, header.length() - 1) + "A",
                claims.path("mth").asText(), claims.path("pth").asText(),
                claims.path("cid").asText()).valid()).isFalse();
        assertThat(verifier.verify(header, "GET", claims.path("pth").asText(),
                claims.path("cid").asText()).valid()).isFalse();
        assertThat(verifier.verify(header, claims.path("mth").asText(), "/wrong",
                claims.path("cid").asText()).valid()).isFalse();

        ChargeSubjectAssertionVerifier expired = new ChargeSubjectAssertionVerifier(
                vector.path("kid").asText(),
                java.util.HexFormat.of().parseHex(vector.path("secretHex").asText()),
                new ChargeSubjectAssertionReplayCache(4096),
                Clock.fixed(Instant.ofEpochSecond(claims.path("exp").asLong() + 6), ZoneOffset.UTC));
        assertThat(expired.verify(header, claims.path("mth").asText(), claims.path("pth").asText(),
                claims.path("cid").asText()).valid()).isFalse();
    }

    @Test
    void executesEverySharedNegativeFixtureCase() throws Exception {
        JsonNode document = fixture();
        for (JsonNode negative : document.path("negativeCases")) {
            JsonNode vector = vectorById(document, negative.path("baseVector").asText());
            ChargeSubjectAssertionResult result = executeNegative(vector, negative.path("mutation").asText());
            String expectedCode = negative.path("expected").path("code").asText();
            int expectedStatus = negative.path("expected").path("status").asInt();

            assertThat(result.valid()).as(negative.path("id").asText()).isFalse();
            assertThat(result.failure().name()).as(negative.path("id").asText()).isEqualTo(expectedCode);
            int actualStatus = result.failure()
                    == ChargeSubjectAssertionFailure.SUBJECT_ASSERTION_CAPACITY_EXHAUSTED ? 503 : 401;
            assertThat(actualStatus).as(negative.path("id").asText()).isEqualTo(expectedStatus);
        }
    }

    @Test
    void replayCacheFailsClosedAt4097AndAdmitsAfterExpiry() {
        ChargeSubjectAssertionReplayCache cache = new ChargeSubjectAssertionReplayCache(4096);
        for (int index = 0; index < 4096; index++) {
            assertThat(cache.claim("kid", "nonce-" + index, 100, 90))
                    .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CLAIMED);
        }
        assertThat(cache.occupancy(90)).isEqualTo(4096);
        assertThat(cache.claim("kid", "overflow", 100, 90))
                .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CAPACITY_EXHAUSTED);
        assertThat(cache.claim("kid", "nonce-0", 100, 90))
                .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.DUPLICATE);
        assertThat(cache.occupancy(106)).isZero();
        assertThat(cache.claim("kid", "after-expiry", 140, 106))
                .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CLAIMED);
    }

    @Test
    void replayCacheAdmits4096ConcurrentUniqueClaimsThenFailsClosedAndRecovers() throws Exception {
        ChargeSubjectAssertionReplayCache cache = new ChargeSubjectAssertionReplayCache(4096);
        ExecutorService executor = Executors.newFixedThreadPool(32);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<ChargeSubjectAssertionReplayCache.ClaimResult>> futures = new ArrayList<>(4096);
        try {
            for (int index = 0; index < 4096; index++) {
                int nonce = index;
                futures.add(executor.submit(() -> {
                    start.await();
                    return cache.claim("kid", "concurrent-" + nonce, 100, 90);
                }));
            }
            start.countDown();
            List<ChargeSubjectAssertionReplayCache.ClaimResult> results = new ArrayList<>(4096);
            for (Future<ChargeSubjectAssertionReplayCache.ClaimResult> future : futures) {
                results.add(future.get(30, TimeUnit.SECONDS));
            }

            assertThat(results).containsOnly(ChargeSubjectAssertionReplayCache.ClaimResult.CLAIMED);
            assertThat(cache.occupancy(90)).isEqualTo(4096);
            assertThat(cache.claim("kid", "concurrent-overflow", 100, 90))
                    .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CAPACITY_EXHAUSTED);
            assertThat(cache.occupancy(106)).isZero();
            assertThat(cache.claim("kid", "concurrent-after-expiry", 140, 106))
                    .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CLAIMED);
        } finally {
            start.countDown();
            executor.shutdownNow();
            assertThat(executor.awaitTermination(30, TimeUnit.SECONDS)).isTrue();
        }
    }

    @Test
    void filterProtectsOnlyVendorAgreementSurfaceAndPublishesTrustedSubject() throws Exception {
        JsonNode vector = fixture().path("vectors").get(0);
        JsonNode claims = vector.path("claims");
        ChargeSubjectAssertionFilter filter = new ChargeSubjectAssertionFilter(
                verifier(vector, new ChargeSubjectAssertionReplayCache(4096)));
        MockHttpServletRequest request =
                new MockHttpServletRequest(claims.path("mth").asText(), claims.path("pth").asText());
        request.addHeader("Accept", "application/vnd.linercore.charge-agreement-v2+json");
        request.addHeader("X-Correlation-Id", claims.path("cid").asText());
        request.addHeader("X-LinerCore-Subject-Assertion", vector.path("headerValue").asText());
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(request.getAttribute(ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE))
                .isEqualTo(claims.path("sub").asText());
    }

    private static ChargeSubjectAssertionVerifier verifier(
            JsonNode vector,
            ChargeSubjectAssertionReplayCache cache) {
        long now = vector.path("verificationInstant").asLong();
        return new ChargeSubjectAssertionVerifier(
                vector.path("kid").asText(),
                java.util.HexFormat.of().parseHex(vector.path("secretHex").asText()),
                cache,
                Clock.fixed(Instant.ofEpochSecond(now), ZoneOffset.UTC));
    }

    private static ChargeSubjectAssertionResult executeNegative(JsonNode vector, String mutation) {
        JsonNode claims = vector.path("claims");
        ChargeSubjectAssertionReplayCache cache = new ChargeSubjectAssertionReplayCache(4096);
        String header = vector.path("headerValue").asText();
        String method = claims.path("mth").asText();
        String path = claims.path("pth").asText();
        String correlation = claims.path("cid").asText();
        long now = vector.path("verificationInstant").asLong();

        switch (mutation) {
            case "REMOVE_SIGNATURE_SEGMENT" ->
                    header = header.substring(0, header.lastIndexOf('.'));
            case "VERIFY_AS_GET" -> method = "GET";
            case "VERIFY_AT_OTHER_PATH" -> path = "/api/charge-agreements/other";
            case "VERIFY_WITH_OTHER_CORRELATION" -> correlation = "corr-other";
            case "FLIP_SIGNATURE_BYTE" ->
                    header = header.substring(0, header.length() - 1)
                            + (header.endsWith("A") ? "B" : "A");
            case "REPLACE_KID" -> {
                String[] parts = header.split("\\.", -1);
                parts[1] = "unknown-key";
                header = String.join(".", parts);
            }
            case "VERIFY_TWICE" -> {
                ChargeSubjectAssertionResult first = verifier(vector, cache)
                        .verify(header, method, path, correlation);
                assertThat(first.valid()).isTrue();
            }
            case "VERIFY_AFTER_EXPIRY_AND_SKEW" -> now = claims.path("exp").asLong() + 6;
            case "CLAIM_4097_DISTINCT_NONCES" -> {
                for (int index = 0; index < 4096; index++) {
                    assertThat(cache.claim("occupied", "nonce-" + index, now + 30, now))
                            .isEqualTo(ChargeSubjectAssertionReplayCache.ClaimResult.CLAIMED);
                }
            }
            default -> throw new IllegalArgumentException("Unsupported fixture mutation: " + mutation);
        }
        ChargeSubjectAssertionVerifier verifier = new ChargeSubjectAssertionVerifier(
                vector.path("kid").asText(),
                java.util.HexFormat.of().parseHex(vector.path("secretHex").asText()),
                cache,
                Clock.fixed(Instant.ofEpochSecond(now), ZoneOffset.UTC));
        return verifier.verify(header, method, path, correlation);
    }

    private static JsonNode vectorById(JsonNode document, String id) {
        for (JsonNode vector : document.path("vectors")) {
            if (id.equals(vector.path("id").asText())) {
                return vector;
            }
        }
        throw new IllegalArgumentException("Shared assertion vector not found: " + id);
    }

    private static JsonNode fixture() throws Exception {
        Path current = Path.of("").toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve("contracts/security/charge-subject-assertion-v1.json");
            if (Files.isRegularFile(candidate)) {
                return MAPPER.readTree(candidate.toFile());
            }
            current = current.getParent();
        }
        throw new IllegalStateException("Shared assertion fixture was not found");
    }
}
