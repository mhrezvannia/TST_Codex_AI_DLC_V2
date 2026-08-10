package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.booking.applicationservice.port.BookingReferenceValidationRequest;
import com.linercore.platform.booking.applicationservice.port.ReferenceCheck;
import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.List;
import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.Semaphore;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class HttpReferenceValidationAdapterLiveTest {
    @Test
    void seededReferencesPassAndUnknownCustomerIsFieldAddressable() {
        String baseUrl = System.getenv().getOrDefault("W0_02_LIVE_REFERENCE_URL", "http://127.0.0.1:8083");
        Assumptions.assumeTrue(reachable("127.0.0.1", 8083), "Reference Data Compose service is not running");
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(new RestTemplate(), baseUrl,
                "booking-service", System.getenv().getOrDefault("REFERENCE_DATA_BOOKING_TOKEN",
                        "reference_data_booking_local_token"), Runnable::run, new Semaphore(10, true),
                Clock.systemUTC(), Duration.ofSeconds(2));
        var checks = List.of(
                new ReferenceCheck("customerId", ReferenceSet.PARTY_CUSTOMER, "party-customer-local-carrier"),
                new ReferenceCheck("routing[0].loadUnLocode", ReferenceSet.LOCATION, "USNYC"),
                new ReferenceCheck("routing[0].dischargeUnLocode", ReferenceSet.LOCATION, "NLRTM"),
                new ReferenceCheck("routing[0].voyageId", ReferenceSet.VESSEL_VOYAGE, "voyage-local-001"),
                new ReferenceCheck("equipment[0].equipmentTypeCode", ReferenceSet.EQUIPMENT_TYPE, "45G1"));

        var valid = adapter.validate(new BookingReferenceValidationRequest(
                new BookingId("booking-live"), 1, "fingerprint-live", checks), "w1-u02-live-active");
        var unknownChecks = new java.util.ArrayList<>(checks);
        unknownChecks.set(0, new ReferenceCheck("customerId", ReferenceSet.PARTY_CUSTOMER, "unknown-customer"));
        var blocked = adapter.validate(new BookingReferenceValidationRequest(
                new BookingId("booking-live"), 1, "fingerprint-live", unknownChecks), "w1-u02-live-unknown");

        assertEquals(0, valid.fieldResults().stream()
                .filter(field -> field.outcome() != ReferenceValidationFieldOutcome.ACTIVE).count());
        assertEquals(ReferenceValidationFieldOutcome.NOT_FOUND, blocked.fieldResults().get(0).outcome());
        assertEquals("customerId", blocked.fieldResults().get(0).fieldPath());
    }

    private static boolean reachable(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 200);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }
}
