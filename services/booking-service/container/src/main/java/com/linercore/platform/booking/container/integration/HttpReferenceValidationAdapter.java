package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import java.util.Locale;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

public class HttpReferenceValidationAdapter implements ReferenceValidationPort {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpReferenceValidationAdapter(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
    }

    @Override
    public boolean activeReference(String referenceSet, String referenceId, String correlationId) {
        if (referenceId == null || referenceId.isBlank()) {
            return false;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            if (correlationId != null && !correlationId.isBlank()) {
                headers.set("X-Correlation-Id", correlationId);
            }
            ReferenceRecord record = restTemplate.exchange(
                    baseUrl + "/reference-sets/{set}/records/{id}",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    ReferenceRecord.class,
                    toReferenceSet(referenceSet),
                    referenceId).getBody();
            return record != null && "ACTIVE".equals(record.status());
        } catch (RestClientResponseException ex) {
            HttpStatusCode status = ex.getStatusCode();
            if (status.is4xxClientError()) {
                return false;
            }
            throw ex;
        }
    }

    private String toReferenceSet(String referenceSet) {
        return referenceSet.replace('-', '_').toUpperCase(Locale.ROOT);
    }

    private String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private record ReferenceRecord(String status) {
    }
}
