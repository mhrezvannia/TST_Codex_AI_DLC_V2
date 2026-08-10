package com.linercore.platform.chargeagreement.container.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public final class HttpRateAuthorizationAdapter implements RateAuthorizationPort {
    private static final int MAX_BODY_BYTES = 16 * 1024;

    private final URI endpoint;
    private final String serviceId;
    private final String serviceToken;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final Semaphore permits = new Semaphore(10, true);

    public HttpRateAuthorizationAdapter(
            String baseUrl,
            String serviceId,
            String serviceToken,
            ObjectMapper mapper) {
        this.endpoint = fixedEndpoint(baseUrl, "/internal/identity/authorize");
        this.serviceId = require(serviceId, "identity service id");
        this.serviceToken = require(serviceToken, "identity service token");
        this.mapper = mapper;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(250))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    @Override
    public Decision authorize(String subjectId, String resource, String action, String correlationId) {
        boolean acquired = false;
        try {
            acquired = permits.tryAcquire(100, TimeUnit.MILLISECONDS);
            if (!acquired) {
                return Decision.UNAVAILABLE;
            }
            byte[] body = mapper.writeValueAsBytes(Map.of(
                    "requestId", UUID.randomUUID().toString(),
                    "correlationId", correlationId,
                    "tokenReference", subjectId,
                    "resource", resource,
                    "action", action,
                    "scope", "internal",
                    "caller", serviceId));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(2))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("X-Correlation-Id", correlationId)
                    .header("X-LinerCore-Service-Id", serviceId)
                    .header("X-LinerCore-Local-Token", serviceToken)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() != 200 || response.body().length > MAX_BODY_BYTES
                    || !response.headers().firstValue("content-type").orElse("")
                            .toLowerCase(java.util.Locale.ROOT).startsWith("application/json")) {
                return Decision.UNAVAILABLE;
            }
            JsonNode decision = mapper.readTree(response.body());
            if (!subjectId.equals(decision.path("subjectId").asText())
                    || !resource.equals(decision.path("resource").asText())
                    || !action.equals(decision.path("action").asText())
                    || !"internal".equals(decision.path("scope").asText())
                    || !correlationId.equals(decision.path("correlationId").asText())
                    || !serviceId.equals(decision.path("caller").asText())) {
                return Decision.UNAVAILABLE;
            }
            return switch (decision.path("result").asText()) {
                case "ALLOW" -> Decision.ALLOW;
                case "DENY" -> Decision.DENY;
                default -> Decision.UNAVAILABLE;
            };
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return Decision.UNAVAILABLE;
        } catch (Exception exception) {
            return Decision.UNAVAILABLE;
        } finally {
            if (acquired) {
                permits.release();
            }
        }
    }

    private static URI fixedEndpoint(String baseUrl, String path) {
        URI base = URI.create(require(baseUrl, "identity base URL"));
        if (!Set.of("http", "https").contains(base.getScheme()) || base.getUserInfo() != null) {
            throw new IllegalArgumentException("identity base URL is invalid");
        }
        return base.resolve(path);
    }

    private static String require(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value;
    }
}
