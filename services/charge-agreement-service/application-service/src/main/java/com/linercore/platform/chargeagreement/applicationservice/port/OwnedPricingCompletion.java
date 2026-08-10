package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import java.util.Objects;

public record OwnedPricingCompletion(
        String idempotencyKey,
        String ownerToken,
        ManualPricingCase proposedManualCase,
        TerminalFactory terminalFactory) {

    public OwnedPricingCompletion {
        idempotencyKey = required(idempotencyKey, "idempotency key");
        ownerToken = required(ownerToken, "owner token");
        terminalFactory = Objects.requireNonNull(terminalFactory, "terminal factory is required");
    }

    @FunctionalInterface
    public interface TerminalFactory {
        PricingTerminalReceipt create(String canonicalManualCaseId);
    }

    private static String required(String value, String field) {
        String normalized = Objects.requireNonNull(value, field + " is required").trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return normalized;
    }
}
