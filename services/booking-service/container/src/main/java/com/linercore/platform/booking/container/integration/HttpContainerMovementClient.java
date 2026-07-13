package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.domain.model.Booking;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.client.RestTemplate;

public class HttpContainerMovementClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpContainerMovementClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    public void publishBookingConfirmed(Booking booking, String correlationId) {
        Instant now = Instant.now();
        String eventId = "booking-confirmed-" + booking.id().value() + "-" + booking.revision();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventId", eventId);
        payload.put("eventType", "booking.confirmed");
        payload.put("schemaVersion", "1.0.0");
        payload.put("source", "booking-service");
        payload.put("occurredAt", now.toString());
        payload.put("correlationId", correlationId);
        payload.put("idempotencyKey", booking.id().value() + ":" + booking.revision() + ":CONFIRMED");
        payload.put("bookingId", booking.id().value());
        payload.put("bookingRevision", booking.revision());
        payload.put("pricingRef", booking.pricingSnapshot() == null ? "" : booking.pricingSnapshot().pricingQuoteId());
        payload.put("customerId", booking.customerId());
        payload.put("originLocationId", booking.originLocationId());
        payload.put("destinationLocationId", booking.destinationLocationId());
        payload.put("containerId", booking.attributes().getOrDefault("containerId", ""));
        payload.put("equipmentTypeId", booking.equipmentType());
        restTemplate.postForObject(baseUrl + "/api/container-movement/booking-confirmed", payload, Object.class);
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }
}
