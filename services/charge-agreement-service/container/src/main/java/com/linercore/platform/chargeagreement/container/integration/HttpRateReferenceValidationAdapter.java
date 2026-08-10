package com.linercore.platform.chargeagreement.container.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public final class HttpRateReferenceValidationAdapter implements RateReferenceValidationPort {
    private static final int MAX_BODY_BYTES = 64 * 1024;

    private final URI baseUri;
    private final String serviceId;
    private final String serviceToken;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final Semaphore permits = new Semaphore(50, true);

    public HttpRateReferenceValidationAdapter(
            String baseUrl,
            String serviceId,
            String serviceToken,
            ObjectMapper mapper) {
        this.baseUri = fixedBase(baseUrl);
        this.serviceId = require(serviceId, "reference service id");
        this.serviceToken = require(serviceToken, "reference service token");
        this.mapper = mapper;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(250))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    @Override
    public List<Violation> validate(Request request) {
        Instant deadline = Instant.now().plusSeconds(2);
        List<Violation> violations = new ArrayList<>();
        for (Check check : request.checks()) {
            validateOne(request.correlationId(), check, deadline, violations);
        }
        return List.copyOf(violations);
    }

    private void validateOne(String correlationId, Check check, Instant deadline, List<Violation> violations) {
        if (check.requestedId() == null || check.requestedId().isBlank()) {
            violations.add(new Violation(check.fieldPath(), "Reference id is required"));
            return;
        }
        boolean acquired = false;
        try {
            long remaining = Math.max(1, Duration.between(Instant.now(), deadline).toMillis());
            acquired = permits.tryAcquire(Math.min(100, remaining), TimeUnit.MILLISECONDS);
            if (!acquired) {
                throw new IllegalStateException("Reference capacity is unavailable");
            }
            URI uri = baseUri.resolve("/reference-sets/" + encode(check.referenceSet()) + "/records/"
                    + encode(check.requestedId()));
            HttpRequest httpRequest = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofMillis(Math.max(1, Duration.between(Instant.now(), deadline).toMillis())))
                    .header("Accept", "application/json")
                    .header("X-Correlation-Id", correlationId)
                    .header("X-LinerCore-Service-Id", serviceId)
                    .header("X-LinerCore-Local-Token", serviceToken)
                    .GET()
                    .build();
            HttpResponse<byte[]> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 404) {
                violations.add(new Violation(check.fieldPath(), "Reference does not exist"));
                return;
            }
            if (response.statusCode() != 200 || response.body().length > MAX_BODY_BYTES
                    || !response.headers().firstValue("content-type").orElse("").toLowerCase(Locale.ROOT)
                            .startsWith("application/json")) {
                throw new IllegalStateException("Reference provider response is unavailable");
            }
            JsonNode record = mapper.readTree(response.body());
            String id = scalar(record.path("id"));
            String set = scalar(record.path("set"));
            String code = scalar(record.path("code"));
            String status = scalar(record.path("status"));
            if (!check.requestedId().equals(id) || !check.referenceSet().equals(set)
                    || !"ACTIVE".equals(status)
                    || (check.expectedCode() != null && !check.expectedCode().equals(code))) {
                violations.add(new Violation(check.fieldPath(), "Reference is inactive or incompatible"));
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Reference validation was interrupted", exception);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Reference provider is unavailable", exception);
        } finally {
            if (acquired) {
                permits.release();
            }
        }
    }

    private static String scalar(JsonNode value) {
        return value.isObject() ? value.path("value").asText() : value.asText();
    }

    private static URI fixedBase(String baseUrl) {
        URI uri = URI.create(require(baseUrl, "reference base URL"));
        if (!Set.of("http", "https").contains(uri.getScheme()) || uri.getUserInfo() != null) {
            throw new IllegalArgumentException("reference base URL is invalid");
        }
        return uri;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String require(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value;
    }
}
