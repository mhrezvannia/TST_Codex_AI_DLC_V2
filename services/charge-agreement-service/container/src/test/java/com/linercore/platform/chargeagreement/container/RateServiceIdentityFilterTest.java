package com.linercore.platform.chargeagreement.container;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import jakarta.servlet.FilterChain;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateServiceIdentityFilterTest {
    private final RateServiceIdentityFilter filter =
            new RateServiceIdentityFilter("charge-agreements-bff", "test-secret");

    @Test
    void rejectsDirectActorAssertionWithoutAuthenticatedService() throws Exception {
        MockHttpServletRequest request = rateRequest();
        request.addHeader("X-Actor-Subject", "pricing-user");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicInteger calls = new AtomicInteger();

        filter.doFilter(request, response, counting(calls));

        assertEquals(401, response.getStatus());
        assertEquals(0, calls.get());
        assertNull(request.getAttribute(RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE));
        assertEquals(true, response.getContentAsString().contains("RATE_SERVICE_IDENTITY_REQUIRED"));
    }

    @Test
    void rejectsWrongCallerOrTokenBeforeBindingSpoofedActor() throws Exception {
        for (String[] credential : new String[][] {
                {"attacker-service", "test-secret"},
                {"charge-agreements-bff", "wrong-secret"}}) {
            MockHttpServletRequest request = rateRequest();
            request.addHeader("X-LinerCore-Service-Id", credential[0]);
            request.addHeader("X-LinerCore-Service-Token", credential[1]);
            request.addHeader("X-Actor-Subject", "pricing-user");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilter(request, response, counting(new AtomicInteger()));

            assertEquals(401, response.getStatus());
            assertNull(request.getAttribute(RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE));
        }
    }

    @Test
    void bindsActorOnlyAfterExactServiceAuthentication() throws Exception {
        MockHttpServletRequest request = rateRequest();
        request.addHeader("X-LinerCore-Service-Id", "charge-agreements-bff");
        request.addHeader("X-LinerCore-Service-Token", "test-secret");
        request.addHeader("X-Actor-Subject", "pricing-user");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicInteger calls = new AtomicInteger();

        filter.doFilter(request, response, counting(calls));

        assertEquals(1, calls.get());
        assertEquals("pricing-user",
                request.getAttribute(RateServiceIdentityFilter.AUTHENTICATED_ACTOR_ATTRIBUTE));
    }

    @Test
    void rejectsConflictingLegacyActorHeaderEvenForAuthenticatedBff() throws Exception {
        MockHttpServletRequest request = rateRequest();
        request.addHeader("X-LinerCore-Service-Id", "charge-agreements-bff");
        request.addHeader("X-LinerCore-Service-Token", "test-secret");
        request.addHeader("X-Actor-Subject", "pricing-user");
        request.addHeader("X-LinerCore-Actor-Id", "attacker");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, counting(new AtomicInteger()));

        assertEquals(400, response.getStatus());
        assertEquals(true, response.getContentAsString().contains("RATE_ACTOR_SPOOF_REJECTED"));
    }

    private static MockHttpServletRequest rateRequest() {
        return new MockHttpServletRequest("POST", "/api/charge-rates");
    }

    private static FilterChain counting(AtomicInteger calls) {
        return (request, response) -> calls.incrementAndGet();
    }
}
