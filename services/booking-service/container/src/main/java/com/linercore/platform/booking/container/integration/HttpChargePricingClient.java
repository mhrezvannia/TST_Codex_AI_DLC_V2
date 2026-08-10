package com.linercore.platform.booking.container.integration;

import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClient;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingClientException;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingFailureType;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingLineItem;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

/**
 * Byte-preserving HTTP transport for the Charge pricing v1 contract.
 */
public final class HttpChargePricingClient implements ChargePricingClient {
    private static final String PRICING_MEDIA_TYPE = "application/vnd.api.v1+json";

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceId;
    private final String serviceToken;
    private final Semaphore permits;

    public HttpChargePricingClient(RestTemplate restTemplate, String baseUrl) {
        this(restTemplate, baseUrl, "booking-service", "", new Semaphore(10, true));
    }

    public HttpChargePricingClient(
            RestTemplate restTemplate,
            String baseUrl,
            String serviceId,
            String serviceToken,
            Semaphore permits) {
        this.restTemplate = restTemplate;
        this.baseUrl = trim(baseUrl);
        this.serviceId = required(serviceId, "Charge service id");
        this.serviceToken = serviceToken == null ? "" : serviceToken.trim();
        this.permits = permits;
    }

    @Override
    public ChargePricingResponse quote(
            byte[] canonicalBody,
            String idempotencyKey,
            String correlationId) throws ChargePricingClientException {
        boolean acquired = false;
        try {
            requireIdentity();
            acquired = permits.tryAcquire(100, TimeUnit.MILLISECONDS);
            if (!acquired) {
                throw failure(
                        ChargePricingFailureType.TRANSIENT,
                        "CHARGE_CAPACITY_EXHAUSTED",
                        "Charge pricing admission timed out",
                        correlationId);
            }
            PricingResponse response = restTemplate.exchange(
                            baseUrl + "/pricing-requests",
                            HttpMethod.POST,
                            new HttpEntity<>(canonicalBody, headers(idempotencyKey, correlationId)),
                            PricingResponse.class)
                    .getBody();
            if (response == null) {
                throw failure(
                        ChargePricingFailureType.TRANSIENT,
                        "PRICING_UNAVAILABLE",
                        "Charge pricing returned an empty response",
                        correlationId);
            }
            return response.toApplication();
        } catch (RestClientResponseException exception) {
            throw classify(exception, correlationId);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw failure(
                    ChargePricingFailureType.TRANSIENT,
                    "PRICING_CANCELLED",
                    "Charge pricing admission was interrupted",
                    correlationId);
        } catch (ChargePricingClientException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw failure(
                    ChargePricingFailureType.TRANSIENT,
                    "PRICING_UNAVAILABLE",
                    "Charge pricing transport failed",
                    correlationId);
        } catch (RuntimeException exception) {
            throw failure(
                    ChargePricingFailureType.MALFORMED,
                    "MALFORMED_PROVIDER_RESPONSE",
                    "Charge pricing response was malformed",
                    correlationId);
        } finally {
            if (acquired) {
                permits.release();
            }
        }
    }

    private void requireIdentity() {
        if (serviceToken.isBlank()) {
            throw failure(
                    ChargePricingFailureType.DENIED,
                    "SERVICE_IDENTITY_MISSING",
                    "Trusted Charge service token is required",
                    null);
        }
    }

    private ChargePricingClientException classify(
            RestClientResponseException exception, String requestCorrelationId) {
        if (exception.getResponseBodyAsByteArray().length > BoundedClientHttpResponse.MAX_BODY_BYTES) {
            return failure(
                    ChargePricingFailureType.TRANSIENT,
                    "PRICING_RESPONSE_TOO_LARGE",
                    "Charge pricing response exceeded 65536 bytes",
                    requestCorrelationId);
        }
        ErrorResponse error = null;
        try {
            error = exception.getResponseBodyAs(ErrorResponse.class);
        } catch (RuntimeException ignored) {
            // Status still has an exact transport classification.
        }
        String code = error == null || blank(error.code()) ? defaultCode(exception) : error.code();
        String reasonCode =
                error == null || blank(error.reasonCode()) ? code : error.reasonCode();
        String correlationId = error == null || blank(error.correlationId())
                ? requestCorrelationId
                : error.correlationId();
        String message = error == null || blank(error.message())
                ? exception.getStatusText()
                : error.message();
        int status = exception.getStatusCode().value();
        ChargePricingFailureType type;
        if (status == 404 && "NO_RATE".equals(reasonCode)) {
            type = ChargePricingFailureType.MANUAL;
        } else if (status == 422 && isManualReason(reasonCode)) {
            type = ChargePricingFailureType.MANUAL;
        } else if (status == 422 || status == 400) {
            type = ChargePricingFailureType.VALIDATION;
        } else if (status == 403) {
            type = ChargePricingFailureType.DENIED;
        } else if (status == 409 && "PRICING_IN_PROGRESS".equals(code)) {
            type = ChargePricingFailureType.IN_PROGRESS;
        } else if (status == 409) {
            type = ChargePricingFailureType.CONFLICT;
        } else {
            type = ChargePricingFailureType.TRANSIENT;
        }
        return new ChargePricingClientException(
                type,
                reasonCode,
                message,
                error == null ? null : error.pricingRequestId(),
                error == null ? null : error.manualCaseId(),
                correlationId,
                type == ChargePricingFailureType.IN_PROGRESS
                        ? retryAfter(exception.getResponseHeaders())
                        : 0);
    }

    private static boolean isManualReason(String reasonCode) {
        return "NO_RATE".equals(reasonCode)
                || "AMBIGUOUS_AGREEMENT_AUTHORITY".equals(reasonCode)
                || "AMBIGUOUS_BASE_RATE".equals(reasonCode)
                || "AMBIGUOUS_SURCHARGE_RATE".equals(reasonCode)
                || "AMBIGUOUS_LOCAL_RATE".equals(reasonCode);
    }

    private static int retryAfter(HttpHeaders headers) {
        if (headers == null) {
            return 1;
        }
        try {
            int parsed = Integer.parseInt(headers.getFirst(HttpHeaders.RETRY_AFTER));
            return parsed >= 1 && parsed <= 30 ? parsed : 1;
        } catch (RuntimeException exception) {
            return 1;
        }
    }

    private static String defaultCode(RestClientResponseException exception) {
        return exception.getStatusCode().value() == 503
                ? "PRICING_UNAVAILABLE"
                : "PRICING_VALIDATION";
    }

    private HttpHeaders headers(String idempotencyKey, String correlationId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(PRICING_MEDIA_TYPE));
        headers.setAccept(List.of(MediaType.parseMediaType(PRICING_MEDIA_TYPE)));
        headers.set("Idempotency-Key", required(idempotencyKey, "idempotency key"));
        headers.set("X-Correlation-Id", required(correlationId, "correlation id"));
        headers.set("X-LinerCore-Service-Id", serviceId);
        headers.set("X-LinerCore-Service-Token", serviceToken);
        return headers;
    }

    private static ChargePricingClientException failure(
            ChargePricingFailureType type,
            String code,
            String message,
            String correlationId) {
        return new ChargePricingClientException(
                type, code, message, null, null, correlationId, 0);
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

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public record PricingResponse(
            String bookingRef,
            String pricingBasis,
            String pricingRef,
            List<PricingLineResponse> charges,
            List<String> applicableDndRuleTypes,
            BigDecimal total,
            String currency,
            LocalDate requestedDepartureDate,
            String pricingRequestId,
            String correlationId,
            Instant pricedAt,
            String agreementVersionId) {
        public PricingResponse {
            charges = List.copyOf(charges == null ? List.of() : charges);
            applicableDndRuleTypes =
                    List.copyOf(applicableDndRuleTypes == null ? List.of() : applicableDndRuleTypes);
        }

        ChargePricingResponse toApplication() {
            return new ChargePricingResponse(
                    bookingRef,
                    pricingBasis,
                    pricingRef,
                    charges.stream().map(PricingLineResponse::toApplication).toList(),
                    applicableDndRuleTypes,
                    total,
                    currency,
                    requestedDepartureDate,
                    pricingRequestId,
                    correlationId,
                    pricedAt,
                    agreementVersionId);
        }
    }

    public record PricingLineResponse(
            String chargeCode,
            String category,
            BigDecimal amount,
            String currency,
            String rateCategory,
            String basis,
            Integer quantity,
            BigDecimal unitRate,
            String sourceRateVersionId) {
        ChargePricingLineItem toApplication() {
            return new ChargePricingLineItem(
                    chargeCode,
                    category,
                    amount,
                    currency,
                    rateCategory,
                    basis,
                    quantity,
                    unitRate,
                    sourceRateVersionId);
        }
    }

    public record ErrorResponse(
            String code,
            String message,
            String correlationId,
            String reasonCode,
            String pricingRequestId,
            String manualCaseId) {}
}
