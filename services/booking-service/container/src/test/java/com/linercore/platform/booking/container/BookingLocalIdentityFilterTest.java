package com.linercore.platform.booking.container;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class BookingLocalIdentityFilterTest {
    private final BookingLocalIdentityFilter filter = new BookingLocalIdentityFilter("secret-token");

    @Test
    void acceptsServerOwnedBffIdentity() throws Exception {
        MockHttpServletRequest request = request("secret-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertEquals(request, chain.getRequest());
    }

    @Test
    void rejectsSpoofedOrMissingToken() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("wrong-token"), response, new MockFilterChain());

        assertEquals(401, response.getStatus());
        assertEquals(true, response.getContentAsString().contains("SERVICE_IDENTITY_DENIED"));
    }

    @Test
    void rejectsActorThatDoesNotBelongToTheCallingService() throws Exception {
        MockHttpServletRequest request = request("secret-token");
        request.removeHeader("X-LinerCore-Actor-Id");
        request.addHeader("X-LinerCore-Actor-Id", "container-movement-service");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(401, response.getStatus());
    }

    @Test
    void rejectsMissingServiceIdentityWithoutServerError() throws Exception {
        MockHttpServletRequest request = request("secret-token");
        request.removeHeader("X-LinerCore-Service-Id");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(401, response.getStatus());
        assertEquals(true, response.getContentAsString().contains("SERVICE_IDENTITY_DENIED"));
    }

    @Test
    void refusesBlankConfiguration() {
        assertThrows(IllegalStateException.class, () -> new BookingLocalIdentityFilter(" "));
    }

    @Test
    void rejectsMissingCorrelationIdentity() throws Exception {
        MockHttpServletRequest request = request("secret-token");
        request.removeHeader("X-Correlation-Id");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(401, response.getStatus());
    }

    @Test
    void rejectsNonJsonAndOversizedCommands() throws Exception {
        MockHttpServletRequest nonJson = request("secret-token");
        nonJson.setContentType("text/plain");
        MockHttpServletResponse nonJsonResponse = new MockHttpServletResponse();
        filter.doFilter(nonJson, nonJsonResponse, new MockFilterChain());

        MockHttpServletRequest oversized = request("secret-token");
        oversized.setContent(new byte[32 * 1024 + 1]);
        MockHttpServletResponse oversizedResponse = new MockHttpServletResponse();
        filter.doFilter(oversized, oversizedResponse, new MockFilterChain());

        assertEquals(415, nonJsonResponse.getStatus());
        assertEquals(413, oversizedResponse.getStatus());
    }

    private MockHttpServletRequest request(String token) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/bookings");
        request.addHeader("X-LinerCore-Service-Id", "booking-bff");
        request.addHeader("X-LinerCore-Actor-Id", "local-user");
        request.addHeader("X-LinerCore-Service-Token", token);
        request.addHeader("X-Correlation-Id", "corr-1");
        request.setContentType("application/json");
        return request;
    }
}
