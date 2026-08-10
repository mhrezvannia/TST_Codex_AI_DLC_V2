package com.linercore.platform.chargeagreement.container;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import jakarta.servlet.FilterChain;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PricingServiceIdentityFilterTest {
    private final PricingServiceIdentityFilter filter =
            new PricingServiceIdentityFilter("booking-service", "test-secret");

    @Test
    void rejectsMissingWrongAndSpoofedIdentityBeforeApplication() throws Exception {
        for (String[] values : new String[][] {
                {null, null, null},
                {"booking-service", "wrong", null},
                {"booking-service", "test-secret", "spoofed"}
        }) {
            MockHttpServletRequest request = request();
            if (values[0] != null) {
                request.addHeader("X-LinerCore-Service-Id", values[0]);
                request.addHeader("X-LinerCore-Service-Token", values[1]);
            }
            if (values[2] != null) {
                request.addHeader("X-LinerCore-Actor-Id", values[2]);
            }
            MockHttpServletResponse response = new MockHttpServletResponse();
            AtomicInteger calls = new AtomicInteger();
            filter.doFilter(request, response, counting(calls));
            assertEquals(0, calls.get());
            assertNull(request.getAttribute(PricingServiceIdentityFilter.VERIFIED_SERVICE_ATTRIBUTE));
        }
    }

    @Test
    void bindsExactTrustedServiceWithSafeCorrelation() throws Exception {
        MockHttpServletRequest request = request();
        request.addHeader("X-LinerCore-Service-Id", "booking-service");
        request.addHeader("X-LinerCore-Service-Token", "test-secret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicInteger calls = new AtomicInteger();

        filter.doFilter(request, response, counting(calls));

        assertEquals(1, calls.get());
        assertEquals("booking-service",
                request.getAttribute(PricingServiceIdentityFilter.VERIFIED_SERVICE_ATTRIBUTE));
    }

    @Test
    void rejectsUnsafeCorrelationBeforeApplication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/pricing-requests");
        request.addHeader("X-Correlation-Id", "bad\ncorrelation");
        request.addHeader("X-LinerCore-Service-Id", "booking-service");
        request.addHeader("X-LinerCore-Service-Token", "test-secret");
        AtomicInteger calls = new AtomicInteger();

        filter.doFilter(request, new MockHttpServletResponse(), counting(calls));

        assertEquals(0, calls.get());
    }

    private static MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/pricing-requests");
        request.addHeader("X-Correlation-Id", "corr-1");
        return request;
    }

    private static FilterChain counting(AtomicInteger calls) {
        return (request, response) -> calls.incrementAndGet();
    }
}
