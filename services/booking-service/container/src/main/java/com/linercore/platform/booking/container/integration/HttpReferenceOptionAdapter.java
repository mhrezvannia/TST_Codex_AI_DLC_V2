package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

public final class HttpReferenceOptionAdapter {
    private static final int PAGE_SIZE = 50;
    private static final Set<String> VOYAGE_ATTRIBUTES = Set.of(
            "recordType", "originLocationId", "destinationLocationId", "carrierVoyageNumber");

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceId;
    private final String serviceToken;

    public HttpReferenceOptionAdapter(
            RestTemplate restTemplate,
            String baseUrl,
            String serviceId,
            String serviceToken) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.serviceId = serviceId;
        this.serviceToken = serviceToken;
    }

    public List<ReferenceOption> activeOptions(ReferenceSet set, String search, String correlationId) {
        String normalized = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() > 64) {
            throw new IllegalArgumentException("reference option search is too long");
        }
        List<ProviderRecord> records = new ArrayList<>();
        int page = 0;
        try {
            while (page < 5) {
                ProviderPage response = restTemplate.exchange(
                        baseUrl + "/reference-sets/{set}/records?includeInactive=false&page={page}&size={size}",
                        HttpMethod.GET, new HttpEntity<>(headers(correlationId)), ProviderPage.class,
                        set.name(), page, PAGE_SIZE).getBody();
                if (response == null || response.records() == null) {
                    throw new RestClientException("empty reference option response");
                }
                records.addAll(response.records());
                if ((long) (page + 1) * response.size() >= response.total()) {
                    break;
                }
                page++;
            }
        } catch (RestClientException exception) {
            throw new ReferenceProviderUnavailable(ReferenceProviderFailureCategory.CONNECTION,
                    "Reference options are unavailable", correlationId, null);
        }
        return records.stream()
                .filter(record -> "ACTIVE".equals(record.status()))
                .filter(record -> normalized.isEmpty()
                        || record.id().value().toLowerCase(Locale.ROOT).contains(normalized)
                        || record.code().value().toLowerCase(Locale.ROOT).contains(normalized)
                        || record.displayName().toLowerCase(Locale.ROOT).contains(normalized))
                .limit(PAGE_SIZE)
                .map(record -> new ReferenceOption(record.id().value(), record.code().value(), record.displayName(),
                        record.version(), safeAttributes(set, record.attributes())))
                .toList();
    }

    private HttpHeaders headers(String correlationId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", correlationId);
        headers.set("X-LinerCore-Service-Id", serviceId);
        headers.set("X-LinerCore-Local-Token", serviceToken);
        return headers;
    }

    private static Map<String, String> safeAttributes(ReferenceSet set, Map<String, String> attributes) {
        if (set != ReferenceSet.VESSEL_VOYAGE || attributes == null) {
            return Map.of();
        }
        return attributes.entrySet().stream()
                .filter(entry -> VOYAGE_ATTRIBUTES.contains(entry.getKey()))
                .collect(java.util.stream.Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public record ReferenceOption(
            String id,
            String code,
            String displayName,
            long version,
            Map<String, String> attributes) {
    }

    private record ProviderPage(List<ProviderRecord> records, int page, int size, long total) {
    }

    private record ProviderRecord(
            Value id,
            String set,
            Value code,
            String displayName,
            String status,
            long version,
            Map<String, String> attributes) {
    }

    private record Value(String value) {
    }
}
