package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.port.BookingReferenceValidationRequest;
import com.linercore.platform.booking.applicationservice.port.ReferenceCheck;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationResult;
import com.linercore.platform.booking.domain.model.ReferenceFieldResult;
import com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

public class HttpReferenceValidationAdapter implements ReferenceValidationPort {
    private static final int MAX_ATTRIBUTES = 32;
    private static final int MAX_RECORD_CHARS = 256 * 1024;
    private static final int PAGE_SIZE = 50;

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceId;
    private final String serviceToken;
    private final Executor executor;
    private final Semaphore outboundPermits;
    private final Clock clock;
    private final Duration deadline;

    public HttpReferenceValidationAdapter(RestTemplate restTemplate, String baseUrl) {
        this(restTemplate, baseUrl, "booking-service", "", Runnable::run, new Semaphore(10, true),
                Clock.systemUTC(), Duration.ofSeconds(2));
    }

    public HttpReferenceValidationAdapter(
            RestTemplate restTemplate,
            String baseUrl,
            String serviceId,
            String serviceToken,
            Executor executor,
            Semaphore outboundPermits,
            Clock clock,
            Duration deadline) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
        this.serviceId = required(serviceId, "reference service id");
        this.serviceToken = serviceToken == null ? "" : serviceToken;
        this.executor = executor;
        this.outboundPermits = outboundPermits;
        this.clock = clock;
        this.deadline = deadline;
    }

    @Override
    public ReferenceValidationResult validate(BookingReferenceValidationRequest request, String correlationId) {
        List<List<ReferenceCheck>> taskGroups = List.of(
                checksFor(request, ReferenceSet.PARTY_CUSTOMER),
                checksFor(request, ReferenceSet.LOCATION, ReferenceSet.VESSEL_VOYAGE),
                checksFor(request, ReferenceSet.EQUIPMENT_TYPE));

        List<CompletableFuture<List<EvaluatedReference>>> futures = new ArrayList<>();
        try {
            taskGroups.stream().filter(group -> !group.isEmpty()).forEach(group -> futures.add(
                    CompletableFuture.supplyAsync(() -> evaluateSet(group, correlationId), executor)));
        } catch (RejectedExecutionException exception) {
            throw unavailable(ReferenceProviderFailureCategory.OVERLOADED,
                    "Reference validation capacity is unavailable", correlationId, Duration.ofSeconds(1));
        }

        try {
            CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new))
                    .get(deadline.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException exception) {
            futures.forEach(future -> future.cancel(true));
            throw unavailable(ReferenceProviderFailureCategory.TIMEOUT,
                    "Reference Data did not respond before the validation deadline", correlationId, null);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw unavailable(ReferenceProviderFailureCategory.CONNECTION,
                    "Reference validation was interrupted", correlationId, null);
        } catch (java.util.concurrent.ExecutionException exception) {
            throw unwrap(exception.getCause(), correlationId);
        }

        Map<String, EvaluatedReference> byPath = new HashMap<>();
        futures.stream().flatMap(future -> future.join().stream())
                .forEach(evaluated -> byPath.put(evaluated.check().fieldPath(), evaluated));
        applyVoyageCoherence(byPath);
        List<ReferenceFieldResult> ordered = request.checks().stream()
                .map(check -> byPath.get(check.fieldPath()))
                .map(EvaluatedReference::result)
                .toList();
        return new ReferenceValidationResult(request.bookingRevision(), request.referenceFingerprint(), ordered,
                clock.instant(), correlationId);
    }

    private static List<ReferenceCheck> checksFor(
            BookingReferenceValidationRequest request,
            ReferenceSet... sets) {
        List<ReferenceSet> included = List.of(sets);
        return request.checks().stream().filter(check -> included.contains(check.referenceSet())).toList();
    }

    private List<EvaluatedReference> evaluateSet(List<ReferenceCheck> checks, String correlationId) {
        return checks.stream().map(check -> evaluate(check, correlationId)).toList();
    }

    private EvaluatedReference evaluate(ReferenceCheck check, String correlationId) {
        ProviderRecord record = resolve(check.referenceSet(), check.requestedValue(), correlationId);
        if (record == null) {
            return evaluated(check, ReferenceValidationFieldOutcome.NOT_FOUND, null, "REFERENCE_NOT_FOUND");
        }
        if (!check.referenceSet().name().equals(record.set())
                || (!check.requestedValue().equals(record.id().value())
                && !check.requestedValue().equals(record.code().value()))) {
            return evaluated(check, ReferenceValidationFieldOutcome.MISMATCH, record, "REFERENCE_MISMATCH");
        }
        if (record.attributes() != null && record.attributes().size() > MAX_ATTRIBUTES) {
            throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                    "Reference Data returned an invalid record", correlationId, null);
        }
        if (estimatedCharacters(record) > MAX_RECORD_CHARS) {
            throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                    "Reference Data returned an oversized record", correlationId, null);
        }
        if (check.referenceSet() == ReferenceSet.VESSEL_VOYAGE
                && !"VOYAGE".equals(record.attributes().get("recordType"))) {
            return evaluated(check, ReferenceValidationFieldOutcome.MISMATCH, record, "VOYAGE_RECORD_REQUIRED");
        }
        if (!"ACTIVE".equals(record.status())) {
            return evaluated(check, ReferenceValidationFieldOutcome.INACTIVE, record, "REFERENCE_INACTIVE");
        }
        return evaluated(check, ReferenceValidationFieldOutcome.ACTIVE, record, "REFERENCE_ACTIVE");
    }

    private ProviderRecord resolve(ReferenceSet set, String requestedValue, String correlationId) {
        ProviderRecord direct = detail(set, requestedValue, correlationId);
        if (direct != null) {
            return direct;
        }
        int page = 0;
        while (page < 20) {
            ProviderPage response = list(set, page, correlationId);
            ProviderRecord match = response.records().stream()
                    .filter(record -> requestedValue.equals(record.id().value())
                            || requestedValue.equals(record.code().value()))
                    .findFirst().orElse(null);
            if (match != null || (long) (page + 1) * response.size() >= response.total()) {
                return match;
            }
            page++;
        }
        throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                "Reference Data paging exceeded the validation bound", correlationId, null);
    }

    private ProviderRecord detail(ReferenceSet set, String requestedValue, String correlationId) {
        try {
            return exchange(baseUrl + "/reference-sets/{set}/records/{id}", ProviderRecord.class,
                    correlationId, set.name(), requestedValue);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw mapResponseFailure(exception.getStatusCode(), correlationId);
        }
    }

    private ProviderPage list(ReferenceSet set, int page, String correlationId) {
        try {
            ProviderPage response = exchange(
                    baseUrl + "/reference-sets/{set}/records?includeInactive=true&page={page}&size={size}",
                    ProviderPage.class, correlationId, set.name(), page, PAGE_SIZE);
            if (response == null || response.records() == null || response.size() < 1 || response.total() < 0) {
                throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                        "Reference Data returned an invalid page", correlationId, null);
            }
            return response;
        } catch (RestClientResponseException exception) {
            throw mapResponseFailure(exception.getStatusCode(), correlationId);
        }
    }

    private <T> T exchange(String url, Class<T> responseType, String correlationId, Object... variables) {
        boolean acquired = false;
        try {
            acquired = outboundPermits.tryAcquire(25, TimeUnit.MILLISECONDS);
            if (!acquired) {
                throw unavailable(ReferenceProviderFailureCategory.OVERLOADED,
                        "Reference validation capacity is unavailable", correlationId, Duration.ofSeconds(1));
            }
            T body = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers(correlationId)),
                    responseType, variables).getBody();
            if (body == null) {
                throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                        "Reference Data returned an empty response", correlationId, null);
            }
            return body;
        } catch (ReferenceProviderUnavailable unavailable) {
            throw unavailable;
        } catch (ResourceAccessException exception) {
            ReferenceProviderFailureCategory category = causedByTimeout(exception)
                    ? ReferenceProviderFailureCategory.TIMEOUT
                    : ReferenceProviderFailureCategory.CONNECTION;
            throw unavailable(category, "Reference Data is unavailable", correlationId, null);
        } catch (RestClientResponseException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw unavailable(ReferenceProviderFailureCategory.CONTRACT,
                    "Reference Data returned an invalid response", correlationId, null);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw unavailable(ReferenceProviderFailureCategory.CONNECTION,
                    "Reference validation was interrupted", correlationId, null);
        } finally {
            if (acquired) {
                outboundPermits.release();
            }
        }
    }

    private static boolean causedByTimeout(Throwable failure) {
        Throwable current = failure;
        while (current != null) {
            if (current instanceof java.net.SocketTimeoutException
                    || current instanceof java.net.http.HttpTimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static int estimatedCharacters(ProviderRecord record) {
        int total = record.id().value().length() + record.code().value().length()
                + record.displayName().length() + record.set().length() + record.status().length();
        if (record.attributes() != null) {
            for (Map.Entry<String, String> entry : record.attributes().entrySet()) {
                total += entry.getKey().length() + (entry.getValue() == null ? 0 : entry.getValue().length());
            }
        }
        return total;
    }

    private HttpHeaders headers(String correlationId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", required(correlationId, "correlation id"));
        headers.set("X-LinerCore-Service-Id", serviceId);
        if (!serviceToken.isBlank()) {
            headers.set("X-LinerCore-Local-Token", serviceToken);
        }
        return headers;
    }

    private void applyVoyageCoherence(Map<String, EvaluatedReference> byPath) {
        List<String> voyagePaths = byPath.keySet().stream()
                .filter(path -> path.matches("routing\\[\\d+].voyageId"))
                .sorted(Comparator.naturalOrder())
                .toList();
        for (String voyagePath : voyagePaths) {
            String prefix = voyagePath.substring(0, voyagePath.lastIndexOf('.') + 1);
            EvaluatedReference voyage = byPath.get(voyagePath);
            EvaluatedReference load = byPath.get(prefix + "loadUnLocode");
            EvaluatedReference discharge = byPath.get(prefix + "dischargeUnLocode");
            if (!active(voyage) || !active(load) || !active(discharge)) {
                continue;
            }
            String expectedOrigin = voyage.record().attributes().get("originLocationId");
            String expectedDestination = voyage.record().attributes().get("destinationLocationId");
            if (!load.record().id().value().equals(expectedOrigin)) {
                byPath.put(load.check().fieldPath(), mismatch(load, "VOYAGE_ORIGIN_MISMATCH"));
                byPath.put(voyage.check().fieldPath(), mismatch(voyage, "VOYAGE_ROUTE_MISMATCH"));
            }
            if (!discharge.record().id().value().equals(expectedDestination)) {
                byPath.put(discharge.check().fieldPath(), mismatch(discharge, "VOYAGE_DESTINATION_MISMATCH"));
                byPath.put(voyage.check().fieldPath(), mismatch(voyage, "VOYAGE_ROUTE_MISMATCH"));
            }
        }
    }

    private static boolean active(EvaluatedReference value) {
        return value != null && value.record() != null
                && value.result().outcome() == ReferenceValidationFieldOutcome.ACTIVE;
    }

    private static EvaluatedReference mismatch(EvaluatedReference value, String reason) {
        return new EvaluatedReference(value.check(), value.result().mismatch(reason), value.record());
    }

    private static EvaluatedReference evaluated(
            ReferenceCheck check,
            ReferenceValidationFieldOutcome outcome,
            ProviderRecord record,
            String reason) {
        ReferenceFieldResult result = new ReferenceFieldResult(check.fieldPath(), check.referenceSet().name(),
                check.requestedValue(), outcome, record == null ? null : record.id().value(),
                record == null ? null : record.code().value(), record == null ? null : record.version(), reason);
        return new EvaluatedReference(check, result, record);
    }

    private static RuntimeException unwrap(Throwable cause, String correlationId) {
        Throwable current = cause instanceof CompletionException ? cause.getCause() : cause;
        if (current instanceof ReferenceProviderUnavailable unavailable) {
            return unavailable;
        }
        return unavailable(ReferenceProviderFailureCategory.CONTRACT,
                "Reference validation failed", correlationId, null);
    }

    private static ReferenceProviderUnavailable mapResponseFailure(HttpStatusCode status, String correlationId) {
        if (status.value() == 429) {
            return unavailable(ReferenceProviderFailureCategory.THROTTLED,
                    "Reference Data is temporarily throttled", correlationId, Duration.ofSeconds(1));
        }
        if (status.is5xxServerError()) {
            return unavailable(ReferenceProviderFailureCategory.SERVER,
                    "Reference Data is unavailable", correlationId, null);
        }
        return unavailable(ReferenceProviderFailureCategory.CONTRACT,
                "Reference Data rejected the service request", correlationId, null);
    }

    private static ReferenceProviderUnavailable unavailable(
            ReferenceProviderFailureCategory category,
            String message,
            String correlationId,
            Duration retryAfter) {
        return new ReferenceProviderUnavailable(category, message, correlationId, retryAfter);
    }

    private static String trim(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }

    private record EvaluatedReference(ReferenceCheck check, ReferenceFieldResult result, ProviderRecord record) {
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
