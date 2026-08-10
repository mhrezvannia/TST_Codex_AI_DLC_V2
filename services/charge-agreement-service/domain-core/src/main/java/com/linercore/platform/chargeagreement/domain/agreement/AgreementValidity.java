package com.linercore.platform.chargeagreement.domain.agreement;

import java.time.LocalDate;
import java.util.Objects;

public record AgreementValidity(LocalDate validFrom, LocalDate validTo) {
    public AgreementValidity {
        Objects.requireNonNull(validFrom, "valid from is required");
        Objects.requireNonNull(validTo, "valid to is required");
        if (validTo.isBefore(validFrom)) {
            throw new IllegalArgumentException("valid to must be on or after valid from");
        }
    }

    public boolean contains(LocalDate date) {
        Objects.requireNonNull(date, "date is required");
        return !date.isBefore(validFrom) && !date.isAfter(validTo);
    }

    public boolean overlaps(AgreementValidity other) {
        Objects.requireNonNull(other, "other validity is required");
        return !validFrom.isAfter(other.validTo) && !validTo.isBefore(other.validFrom);
    }
}
