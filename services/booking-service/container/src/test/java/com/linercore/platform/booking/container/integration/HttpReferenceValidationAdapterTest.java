package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class HttpReferenceValidationAdapterTest {
    @Test
    void validatesCanonicalVesselVoyageSetAndFailsClosedForUnknownId() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(restTemplate, "http://reference.test");

        server.expect(requestTo("http://reference.test/reference-sets/VESSEL_VOYAGE/records/voyage-local-001"))
                .andExpect(header("X-Correlation-Id", "corr-1"))
                .andRespond(withSuccess("{\"status\":\"ACTIVE\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://reference.test/reference-sets/VESSEL_VOYAGE/records/unknown-voyage"))
                .andRespond(withResourceNotFound());

        assertTrue(adapter.activeReference("vessel-voyage", "voyage-local-001", "corr-1"));
        assertFalse(adapter.activeReference("vessel-voyage", "unknown-voyage", "corr-2"));
        server.verify();
    }
}
