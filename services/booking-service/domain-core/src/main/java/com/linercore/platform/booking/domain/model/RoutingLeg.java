package com.linercore.platform.booking.domain.model;

import java.util.Locale;

public record RoutingLeg(
        int legSequence,
        String loadUnLocode,
        String dischargeUnLocode,
        String voyageId) {

    public RoutingLeg {
        if (legSequence < 1) {
            throw new IllegalArgumentException("leg sequence must be positive");
        }
        loadUnLocode = normalizeUnLocode(loadUnLocode, "load UN/LOCODE");
        dischargeUnLocode = normalizeUnLocode(dischargeUnLocode, "discharge UN/LOCODE");
        if (loadUnLocode.equals(dischargeUnLocode)) {
            throw new IllegalArgumentException("load and discharge UN/LOCODE must differ");
        }
        voyageId = required(voyageId, "voyage id");
    }

    private static String normalizeUnLocode(String value, String label) {
        String normalized = required(value, label).toUpperCase(Locale.ROOT);
        if (!normalized.matches("[A-Z]{2}[A-Z0-9]{3}")) {
            throw new IllegalArgumentException(label + " must use UN/LOCODE shape");
        }
        return normalized;
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}
