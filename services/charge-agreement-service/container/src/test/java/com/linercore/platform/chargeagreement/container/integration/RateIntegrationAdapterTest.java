package com.linercore.platform.chargeagreement.container.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class RateIntegrationAdapterTest {
    @Test
    void localAgreementAuthorizationUsesExplicitLeastPrivilegeMap() {
        LocalAgreementAuthorizationAdapter adapter = new LocalAgreementAuthorizationAdapter();

        assertEquals(AgreementAuthorizationPort.Decision.ALLOW,
                adapter.authorize("local.pricing.analyst", "charge-agreements", "approve", "corr-1"));
        assertEquals(AgreementAuthorizationPort.Decision.ALLOW,
                adapter.authorize("local.charge.reader", "charge-agreements", "read", "corr-1"));
        assertEquals(AgreementAuthorizationPort.Decision.DENY,
                adapter.authorize("local.charge.reader", "charge-agreements", "approve", "corr-1"));
        assertEquals(AgreementAuthorizationPort.Decision.DENY,
                adapter.authorize("unknown", "charge-agreements", "read", "corr-1"));
    }

    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void localPolicyGrantsOnlyTheExplicitRateCapabilities() {
        LocalRateAuthorizationAdapter adapter = new LocalRateAuthorizationAdapter();

        assertEquals(RateAuthorizationPort.Decision.ALLOW,
                adapter.authorize("local.pricing.analyst", "charge-rates", "approve", "corr-1"));
        assertEquals(RateAuthorizationPort.Decision.ALLOW,
                adapter.authorize("local.charge.reader", "charge-rates", "read", "corr-1"));
        assertEquals(RateAuthorizationPort.Decision.DENY,
                adapter.authorize("local.charge.reader", "charge-rates", "update", "corr-1"));
        assertEquals(RateAuthorizationPort.Decision.DENY,
                adapter.authorize("local.pricing.analyst", "other-resource", "read", "corr-1"));
    }

    @Test
    void identityAdapterAcceptsOnlyAnExactAllowEchoAndSendsServiceCredentials() throws Exception {
        AtomicReference<String> token = new AtomicReference<>();
        start(exchange -> {
            token.set(exchange.getRequestHeaders().getFirst("X-LinerCore-Local-Token"));
            respond(exchange, 200, "application/json",
                    decision("subject-1", "charge-rates", "read", "internal", "corr-1",
                            "charge-service", "ALLOW"));
        });
        HttpRateAuthorizationAdapter adapter = identityAdapter();

        assertEquals(RateAuthorizationPort.Decision.ALLOW,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        assertEquals("secret-token", token.get());
    }

    @Test
    void identityAdapterFailsClosedForDenialEchoMismatchAndMalformedResponses() throws Exception {
        AtomicReference<String> response = new AtomicReference<>(
                decision("subject-1", "charge-rates", "read", "internal", "corr-1",
                        "charge-service", "DENY"));
        start(exchange -> respond(exchange, 200, "application/json", response.get()));
        HttpRateAuthorizationAdapter adapter = identityAdapter();

        assertEquals(RateAuthorizationPort.Decision.DENY,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set(decision("subject-1", "other", "read", "internal", "corr-1",
                "charge-service", "ALLOW"));
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set(decision("attacker", "charge-rates", "read", "internal", "corr-1",
                "charge-service", "ALLOW"));
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set(decision("subject-1", "charge-rates", "read", "internal", "other-correlation",
                "charge-service", "ALLOW"));
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set(decision("subject-1", "charge-rates", "read", "other-scope", "corr-1",
                "charge-service", "ALLOW"));
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set(decision("subject-1", "charge-rates", "read", "internal", "corr-1",
                "other-caller", "ALLOW"));
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        response.set("not-json");
        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                adapter.authorize("subject-1", "charge-rates", "read", "corr-1"));
        assertTrue(!Thread.currentThread().isInterrupted(), "malformed responses must not interrupt the caller");
    }

    @Test
    void identityAdapterRejectsRedirectsAndInvalidCredentialConfiguration() throws Exception {
        start(exchange -> {
            exchange.getResponseHeaders().set("Location", "https://example.invalid/authorize");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });

        assertEquals(RateAuthorizationPort.Decision.UNAVAILABLE,
                identityAdapter().authorize("subject-1", "charge-rates", "read", "corr-1"));
        assertThrows(IllegalArgumentException.class,
                () -> new HttpRateAuthorizationAdapter(baseUrl(), "charge-service", "", new ObjectMapper()));
        assertThrows(IllegalArgumentException.class,
                () -> new HttpRateAuthorizationAdapter("https://user@example.invalid", "charge-service",
                        "secret-token", new ObjectMapper()));
    }

    @Test
    void referenceAdapterValidatesCanonicalSetIdCodeAndActiveState() throws Exception {
        start(exchange -> respond(exchange, 200, "application/json",
                "{\"id\":\"charge-code-ofr\",\"set\":\"CHARGE_CODE\",\"code\":\"OFR\",\"status\":\"ACTIVE\"}"));
        HttpRateReferenceValidationAdapter adapter = referenceAdapter();

        List<RateReferenceValidationPort.Violation> violations = adapter.validate(
                new RateReferenceValidationPort.Request("corr-1", List.of(
                        new RateReferenceValidationPort.Check(
                                "chargeCodeId", "CHARGE_CODE", "charge-code-ofr", "OFR"))));

        assertTrue(violations.isEmpty());
    }

    @Test
    void referenceAdapterReturnsTypedViolationsAndTreatsProviderFailureAsUnavailable() throws Exception {
        AtomicReference<Integer> status = new AtomicReference<>(200);
        start(exchange -> {
            if (status.get() == 404) {
                respond(exchange, 404, "application/json", "{}");
            } else {
                respond(exchange, 200, "application/json",
                        "{\"id\":\"wrong\",\"set\":\"CHARGE_CODE\",\"code\":\"BAF\",\"status\":\"INACTIVE\"}");
            }
        });
        HttpRateReferenceValidationAdapter adapter = referenceAdapter();
        var request = new RateReferenceValidationPort.Request("corr-1", List.of(
                new RateReferenceValidationPort.Check("chargeCodeId", "CHARGE_CODE", "charge-code-ofr", "OFR")));

        assertEquals("Reference is inactive or incompatible", adapter.validate(request).getFirst().reason());
        status.set(404);
        assertEquals("Reference does not exist", adapter.validate(request).getFirst().reason());

        stopServer();
        assertThrows(IllegalStateException.class, () -> adapter.validate(request));
    }

    private HttpRateAuthorizationAdapter identityAdapter() {
        return new HttpRateAuthorizationAdapter(baseUrl(), "charge-service", "secret-token", new ObjectMapper());
    }

    private HttpRateReferenceValidationAdapter referenceAdapter() {
        return new HttpRateReferenceValidationAdapter(baseUrl(), "charge-service", "secret-token",
                new ObjectMapper());
    }

    private void start(ExchangeHandler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> handler.handle(exchange));
        server.start();
    }

    private String baseUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    private static void respond(HttpExchange exchange, int status, String contentType, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    private static String decision(
            String subject,
            String resource,
            String action,
            String scope,
            String correlation,
            String caller,
            String result) {
        return """
                {"subjectId":"%s","resource":"%s","action":"%s","scope":"%s",
                 "correlationId":"%s","caller":"%s","result":"%s"}
                """.formatted(subject, resource, action, scope, correlation, caller, result);
    }

    @FunctionalInterface
    private interface ExchangeHandler {
        void handle(HttpExchange exchange) throws IOException;
    }
}
