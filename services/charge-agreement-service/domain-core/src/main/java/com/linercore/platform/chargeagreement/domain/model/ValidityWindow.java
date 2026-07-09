package com.linercore.platform.chargeagreement.domain.model;

import java.time.LocalDate;

public record ValidityWindow(LocalDate from, LocalDate to) {
    public ValidityWindow {
        if (from == null || to == null) {
            throw new IllegalArgumentException("validity dates are required");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("validity end must be on or after start");
        }
    }

    public boolean contains(LocalDate date) {
        return date != null && !date.isBefore(from) && !date.isAfter(to);
    }

    public boolean contains(ValidityWindow other) {
        return other != null && contains(other.from()) && contains(other.to());
    }
}
