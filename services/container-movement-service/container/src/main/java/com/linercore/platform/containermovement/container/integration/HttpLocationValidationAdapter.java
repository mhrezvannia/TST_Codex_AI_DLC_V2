package com.linercore.platform.containermovement.container.integration;

import com.linercore.platform.containermovement.applicationservice.port.ReferenceValidationPort;
import java.util.List;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

public class HttpLocationValidationAdapter implements ReferenceValidationPort {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpLocationValidationAdapter(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    @Override
    public List<String> inactiveLocationIds(List<String> locationIds, String correlationId) {
        return locationIds.stream()
                .filter(locationId -> !activeLocation(locationId))
                .toList();
    }

    private boolean activeLocation(String locationId) {
        if (locationId == null || locationId.isBlank()) {
            return false;
        }
        try {
            ReferenceRecord record = restTemplate.getForObject(
                    baseUrl + "/reference-sets/LOCATION/records/{id}",
                    ReferenceRecord.class,
                    locationId);
            return record != null && "ACTIVE".equals(record.status());
        } catch (RestClientResponseException ex) {
            HttpStatusCode status = ex.getStatusCode();
            if (status.is4xxClientError()) {
                return false;
            }
            throw ex;
        }
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private record ReferenceRecord(String status) {
    }
}
