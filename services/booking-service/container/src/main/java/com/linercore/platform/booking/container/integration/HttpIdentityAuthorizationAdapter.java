package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import java.util.UUID;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

public class HttpIdentityAuthorizationAdapter implements AuthorizationPort {
    private final RestTemplate restTemplate;
    private final String identityServiceUrl;

    public HttpIdentityAuthorizationAdapter(RestTemplate restTemplate, String identityServiceUrl) {
        this.restTemplate = restTemplate;
        this.identityServiceUrl = identityServiceUrl.replaceAll("/+$", "");
    }

    @Override
    public boolean allowed(String subjectId, String resource, String action, String correlationId) {
        if (subjectId == null || subjectId.isBlank() || correlationId == null || correlationId.isBlank()) {
            return false;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", correlationId);
        AuthorizationRequest request = new AuthorizationRequest(
                UUID.randomUUID().toString(),
                correlationId,
                subjectId,
                resource,
                action,
                null,
                "booking-service");
        try {
            AuthorizationDecision decision = restTemplate.postForObject(
                    identityServiceUrl + "/internal/identity/authorize",
                    new HttpEntity<>(request, headers),
                    AuthorizationDecision.class);
            return decision != null
                    && "ALLOW".equals(decision.result())
                    && resource.equals(decision.resource())
                    && action.equals(decision.action());
        } catch (RestClientException ex) {
            return false;
        }
    }

    record AuthorizationRequest(
            String requestId,
            String correlationId,
            String tokenReference,
            String resource,
            String action,
            String scope,
            String caller) {
    }

    record AuthorizationDecision(
            String decisionId,
            String subjectId,
            String result,
            String reasonCode,
            String resource,
            String action,
            String scope,
            String evaluatedAt,
            String policyVersion,
            String correlationId) {
    }
}
