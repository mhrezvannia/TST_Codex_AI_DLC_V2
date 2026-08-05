package com.linercore.platform.chargeagreement.applicationservice.port;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Objects;

public record PricingTerminalReceipt(
        int httpStatus,
        String schemaVersion,
        String pricingRequestId,
        String terminalCode,
        byte[] responseSnapshot,
        String correlationId,
        Instant completedAt,
        String manualCaseId) {

    public static final String SCHEMA_VERSION = "pricing.v1";
    public static final String PRICING_MEDIA_TYPE = "application/vnd.api.v1+json";
    public static final String ERROR_MEDIA_TYPE = "application/json";

    public PricingTerminalReceipt {
        if (httpStatus != 200 && httpStatus != 404 && httpStatus != 422) {
            throw new IllegalArgumentException("terminal HTTP status must be 200, 404, or 422");
        }
        if (!SCHEMA_VERSION.equals(schemaVersion)) {
            throw new IllegalArgumentException("terminal schema must be pricing.v1");
        }
        pricingRequestId = required(pricingRequestId, "pricing request ID", 128);
        terminalCode = required(terminalCode, "terminal code", 128);
        responseSnapshot = Arrays.copyOf(
                Objects.requireNonNull(responseSnapshot, "response snapshot is required"),
                responseSnapshot.length);
        if (responseSnapshot.length == 0) {
            throw new IllegalArgumentException("response snapshot must not be empty");
        }
        correlationId = required(correlationId, "correlation ID", 128);
        completedAt = Objects.requireNonNull(completedAt, "completion time is required");
        if (httpStatus == 200) {
            if (!"PRICED".equals(terminalCode) || manualCaseId != null) {
                throw new IllegalArgumentException("priced terminal must have no manual case");
            }
        } else {
            manualCaseId = required(manualCaseId, "manual case ID", 64);
            if ("PRICED".equals(terminalCode)) {
                throw new IllegalArgumentException("manual terminal cannot use PRICED code");
            }
        }
    }

    @Override
    public byte[] responseSnapshot() {
        return Arrays.copyOf(responseSnapshot, responseSnapshot.length);
    }

    public String responseUtf8() {
        return new String(responseSnapshot, StandardCharsets.UTF_8);
    }

    public String contentType() {
        return httpStatus == 200 ? PRICING_MEDIA_TYPE : ERROR_MEDIA_TYPE;
    }

    private static String required(String value, String field, int maxLength) {
        String normalized = Objects.requireNonNull(value, field + " is required").trim();
        if (normalized.isEmpty() || normalized.length() > maxLength) {
            throw new IllegalArgumentException(field + " is invalid");
        }
        return normalized;
    }
}
