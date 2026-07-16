package com.linercore.platform.containermovement.container.integration;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.MovementEvent;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.client.RestTemplate;

public class HttpBookingMovementStatusClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpBookingMovementStatusClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    public void publishStatus(ContainerJourney journey, String correlationId) {
        long sequenceNumber = journey.history().size();
        MovementEvent latest = journey.history().isEmpty() ? null : journey.history().get(journey.history().size() - 1);
        String eventId = "movement-status-" + journey.id().value() + "-" + sequenceNumber + "-" + journey.status().name();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventId", eventId);
        payload.put("eventType", "containermovement.status");
        payload.put("schemaVersion", "1.0.0");
        payload.put("source", "container-movement-service");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("correlationId", correlationId);
        payload.put("idempotencyKey", journey.id().value() + ":" + journey.status().name() + ":" + sequenceNumber);
        payload.put("containerId", journey.containerId());
        payload.put("bookingId", journey.bookingId());
        payload.put("movementStatus", journey.status().name());
        payload.put("sequenceNumber", sequenceNumber);
        payload.put("statusReason", latest == null ? "Journey created" : "Validated movement " + latest.eventType().name());
        payload.put("lastKnownLocationId", latest == null ? "" : latest.locationId());
        restTemplate.postForObject(baseUrl + "/api/bookings/movement-status", payload, Object.class);
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }
}
