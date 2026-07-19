package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class HttpIdentityAuthorizationAdapterTest {
    private final RestTemplate restTemplate = new RestTemplate();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
    private final HttpIdentityAuthorizationAdapter adapter =
            new HttpIdentityAuthorizationAdapter(restTemplate, "http://identity-service:8082/");

    @Test
    void allowsOnlyIdentityAllowDecisionForMatchingResourceAndAction() {
        server.expect(requestTo("http://identity-service:8082/internal/identity/authorize"))
                .andExpect(header("X-Correlation-Id", "corr-1"))
                .andExpect(jsonPath("$.tokenReference").value("local.booking.user"))
                .andExpect(jsonPath("$.resource").value("booking"))
                .andExpect(jsonPath("$.action").value("create"))
                .andExpect(jsonPath("$.caller").value("booking-service"))
                .andRespond(withSuccess("""
                        {"decisionId":"d1","subjectId":"local.booking.user","result":"ALLOW","reasonCode":"ALLOW","resource":"booking","action":"create","correlationId":"corr-1"}
                        """, MediaType.APPLICATION_JSON));

        assertTrue(adapter.allowed("local.booking.user", "booking", "create", "corr-1"));
        server.verify();
    }

    @Test
    void deniesDenyDecisionMismatchedDecisionAndIdentityErrors() {
        server.expect(requestTo("http://identity-service:8082/internal/identity/authorize"))
                .andRespond(withSuccess("""
                        {"decisionId":"d1","subjectId":"local.booking.user","result":"DENY","reasonCode":"DENY_NO_PERMISSION","resource":"booking","action":"create","correlationId":"corr-1"}
                        """, MediaType.APPLICATION_JSON));
        assertFalse(adapter.allowed("local.booking.user", "booking", "create", "corr-1"));

        server.reset();
        server.expect(requestTo("http://identity-service:8082/internal/identity/authorize"))
                .andRespond(withSuccess("""
                        {"decisionId":"d1","subjectId":"local.booking.user","result":"ALLOW","reasonCode":"ALLOW","resource":"booking","action":"read","correlationId":"corr-1"}
                        """, MediaType.APPLICATION_JSON));
        assertFalse(adapter.allowed("local.booking.user", "booking", "create", "corr-1"));

        server.reset();
        server.expect(requestTo("http://identity-service:8082/internal/identity/authorize"))
                .andRespond(withServerError());
        assertFalse(adapter.allowed("local.booking.user", "booking", "create", "corr-1"));
    }

    @Test
    void failsClosedForMissingActorOrCorrelation() {
        assertFalse(adapter.allowed("", "booking", "create", "corr-1"));
        assertFalse(adapter.allowed("local.booking.user", "booking", "create", " "));
    }
}
