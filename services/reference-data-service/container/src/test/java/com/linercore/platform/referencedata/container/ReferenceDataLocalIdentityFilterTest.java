package com.linercore.platform.referencedata.container;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ReferenceDataLocalIdentityFilterTest {
    private final ReferenceDataLocalIdentityFilter filter = new ReferenceDataLocalIdentityFilter(Map.of(
            "booking-service", "booking-token",
            "apps-reference-data", "bff-token"));

    @Test
    void requiresKnownConstantTimeLocalIdentity() throws Exception {
        MockHttpServletResponse missing = invoke("GET", null, null);
        MockHttpServletResponse wrong = invoke("GET", "booking-service", "wrong-token");
        MockHttpServletResponse valid = invoke("GET", "booking-service", "booking-token");

        assertEquals(401, missing.getStatus());
        assertEquals(401, wrong.getStatus());
        assertEquals(200, valid.getStatus());
    }

    @Test
    void bookingIsReadOnlyWhileReferenceBffMayMutate() throws Exception {
        assertEquals(403, invoke("PUT", "booking-service", "booking-token").getStatus());
        assertEquals(200, invoke("PUT", "apps-reference-data", "bff-token").getStatus());
    }

    private MockHttpServletResponse invoke(String method, String clientId, String token) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method,
                "/reference-sets/LOCATION/records/location-usnyc");
        if (clientId != null) request.addHeader("X-LinerCore-Service-Id", clientId);
        if (token != null) request.addHeader("X-LinerCore-Local-Token", token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
