package com.linercore.platform.containermovement.container.integration;

import com.linercore.platform.containermovement.applicationservice.port.ReferenceValidationPort;
import java.util.List;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

public class HttpLocationValidationAdapter implements ReferenceValidationPort {
    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceToken;

    public HttpLocationValidationAdapter(RestTemplate restTemplate, String baseUrl) {
        this(restTemplate, baseUrl, "");
    }

    public HttpLocationValidationAdapter(RestTemplate restTemplate, String baseUrl, String serviceToken) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
        this.serviceToken = serviceToken == null ? "" : serviceToken;
    }

    @Override
    public List<String> inactiveLocationIds(List<String> locationIds, String correlationId) {
        return locationIds.stream()
                .filter(locationId -> !activeLocation(locationId, correlationId))
                .toList();
    }

    private boolean activeLocation(String locationId, String correlationId) {
        if (locationId == null || locationId.isBlank()) {
            return false;
        }
        try {
            ReferenceRecord record = restTemplate.exchange(
                    baseUrl + "/reference-sets/LOCATION/records/{id}",
                    HttpMethod.GET,
                    new HttpEntity<>(headers(correlationId)),
                    ReferenceRecord.class,
                    locationId).getBody();
            return record != null && "ACTIVE".equals(record.status());
        } catch (RestClientResponseException ex) {
            HttpStatusCode status = ex.getStatusCode();
            if (status.value() == 404) {
                return activeLocationByCode(locationId, correlationId);
            }
            if (status.is4xxClientError()) {
                return false;
            }
            throw ex;
        }
    }

    private boolean activeLocationByCode(String locationCode, String correlationId) {
        int page = 0;
        while (page < 20) {
            ReferencePage response = restTemplate.exchange(
                    baseUrl + "/reference-sets/LOCATION/records"
                            + "?includeInactive=true&page={page}&size=100",
                    HttpMethod.GET,
                    new HttpEntity<>(headers(correlationId)),
                    ReferencePage.class,
                    page).getBody();
            if (response == null || response.records() == null) {
                return false;
            }
            ReferenceRecord match = response.records().stream()
                    .filter(record -> record.code() != null
                            && locationCode.equals(record.code().value()))
                    .findFirst()
                    .orElse(null);
            if (match != null) {
                return "ACTIVE".equals(match.status());
            }
            if ((long) (page + 1) * response.size() >= response.total()) {
                return false;
            }
            page++;
        }
        return false;
    }

    private HttpHeaders headers(String correlationId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", correlationId);
        headers.set("X-LinerCore-Service-Id", "container-movement-service");
        if (!serviceToken.isBlank()) {
            headers.set("X-LinerCore-Local-Token", serviceToken);
        }
        return headers;
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private record ReferencePage(List<ReferenceRecord> records, int page, int size, long total) {
    }

    private record ReferenceRecord(ReferenceValue id, ReferenceValue code, String status) {
    }

    private record ReferenceValue(String value) {
    }
}
