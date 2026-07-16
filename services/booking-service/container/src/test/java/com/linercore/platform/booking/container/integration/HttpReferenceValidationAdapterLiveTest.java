package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.web.client.RestTemplate;

@EnabledIfEnvironmentVariable(named = "W0_02_LIVE_REFERENCE_URL", matches = ".+")
class HttpReferenceValidationAdapterLiveTest {
    @Test
    void seededVoyageIsActiveAndUnknownVoyageFailsClosed() {
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(
                new RestTemplate(), System.getenv("W0_02_LIVE_REFERENCE_URL"));

        assertTrue(adapter.activeReference("vessel-voyage", "voyage-local-001", "w0-02-live-seeded"));
        assertFalse(adapter.activeReference("vessel-voyage", "unknown-voyage", "w0-02-live-unknown"));
    }
}
