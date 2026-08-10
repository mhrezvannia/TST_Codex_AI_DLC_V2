package com.linercore.platform.chargeagreement.domain.model;

import java.time.Instant;
import java.util.Objects;

public record ManualPricingCase(
        String caseId,
        String pricingRequestId,
        String reasonCode,
        String status,
        String bookingRef,
        Integer amendmentSeq,
        String requestHash,
        String correlationId,
        Instant openedAt,
        RequestContext requestContext,
        boolean legacyEvidence) {

    public static final String OPEN = "OPEN";

    public ManualPricingCase {
        caseId = required(caseId, "case ID", 64);
        pricingRequestId = required(pricingRequestId, "pricing request ID", 128);
        reasonCode = required(reasonCode, "reason code", 128);
        if (!OPEN.equals(status)) {
            throw new IllegalArgumentException("manual pricing case status must be OPEN");
        }
        if (amendmentSeq != null && amendmentSeq < 0) {
            throw new IllegalArgumentException("amendment sequence must not be negative");
        }
        if (requestHash != null && !requestHash.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException("request hash must be lowercase SHA-256");
        }
        if (!legacyEvidence) {
            bookingRef = required(bookingRef, "booking reference", 128);
            Objects.requireNonNull(amendmentSeq, "amendment sequence is required");
            requestHash = required(requestHash, "request hash", 64);
            correlationId = required(correlationId, "correlation ID", 128);
            openedAt = Objects.requireNonNull(openedAt, "opened time is required");
            requestContext = Objects.requireNonNull(requestContext, "request context is required");
        }
    }

    public ManualPricingCase(
            String caseId,
            String pricingRequestId,
            String reasonCode,
            String correlationId,
            Instant openedAt) {
        this(caseId, pricingRequestId, reasonCode, OPEN, null, null, null,
                correlationId, openedAt, null, true);
    }

    public static ManualPricingCase open(
            String caseId,
            PricingRequest request,
            String reasonCode,
            String requestHash,
            Instant openedAt) {
        Objects.requireNonNull(request, "pricing request is required");
        return new ManualPricingCase(
                caseId,
                request.pricingRequestId(),
                reasonCode,
                OPEN,
                request.bookingRef(),
                request.quantities().amendmentSeq(),
                requestHash,
                request.correlationId(),
                openedAt,
                RequestContext.from(request),
                false);
    }

    public String dedupeKey() {
        return canonicalDedupeKey(pricingRequestId, reasonCode);
    }

    public static String canonicalDedupeKey(String pricingRequestId, String reasonCode) {
        String request = required(pricingRequestId, "pricing request ID", 128);
        String reason = required(reasonCode, "reason code", 128);
        return "manual:v1|" + request.length() + ":" + request
                + "|" + reason.length() + ":" + reason;
    }

    private static String required(String value, String field, int maxLength) {
        String normalized = Objects.requireNonNull(value, field + " is required").trim();
        if (normalized.isEmpty() || normalized.length() > maxLength) {
            throw new IllegalArgumentException(field + " is invalid");
        }
        return normalized;
    }

    public record RequestContext(
            String tradeLane,
            String pol,
            String pod,
            String equipmentType,
            String partyId,
            String commodityCode,
            boolean reeferIndicator,
            boolean dgIndicator,
            PricingRequest.PricingDates dates,
            PricingRequest.PricingQuantities quantities) {

        public RequestContext {
            Objects.requireNonNull(dates, "pricing dates are required");
            Objects.requireNonNull(quantities, "pricing quantities are required");
        }

        public static RequestContext from(PricingRequest request) {
            return new RequestContext(
                    request.tradeLane(),
                    request.pol(),
                    request.pod(),
                    request.equipmentType(),
                    request.partyId(),
                    request.commodityCode(),
                    request.reeferIndicator(),
                    request.dgIndicator(),
                    request.dates(),
                    request.quantities());
        }
    }
}
